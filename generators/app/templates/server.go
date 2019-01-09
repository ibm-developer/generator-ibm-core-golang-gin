package main

import (
	"{{sanitizedName}}/routers"
	"{{sanitizedName}}/plugins"
    {{#if addServices}}
	"{{sanitizedName}}/services"
    {{/if}}
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/static"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/afex/hystrix-go/hystrix"
	"github.com/afex/hystrix-go/hystrix/metric_collector"
	// "github.com/opentracing/opentracing-go"
	// "github.com/opentracing/opentracing-go/ext"
	// "github.com/uber/jaeger-client-go"
	// jaegerprom "github.com/uber/jaeger-lib/metrics/prometheus"
	log "github.com/sirupsen/logrus"
	"os"
	"net/http"
)

func port() string {
	port := os.Getenv("PORT")
	if len(port) == 0 {
		port = "8080"
	}
	return ":" + port
}

func HystrixHandler(command string) gin.HandlerFunc {
	return func(c *gin.Context) {
		hystrix.Do(command, func() error {
			c.Next()
			return nil
		}, func(err error) error {
{{#ifCond applicationType '===' 'WEBAPP'}}
			c.HTML(http.StatusInternalServerError, "500.html", nil)
{{else}}
			c.String(http.StatusInternalServerError, "500 Internal Server Error")
{{/ifCond}}
			return err
		})
	}
}

func RequestTracker(counter *prometheus.CounterVec) gin.HandlerFunc {
	return func(c *gin.Context) {
		labels := map[string]string{"Route": c.Request.URL.Path, "Method": c.Request.Method}
		counter.With(labels).Inc()
		c.Next()
	}
}

// func OpenTracing() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		wireCtx, _ := opentracing.GlobalTracer().Extract(
// 			opentracing.HTTPHeaders,
// 			opentracing.HTTPHeadersCarrier(c.Request.Header))
// 		serverSpan := opentracing.StartSpan(c.Request.URL.Path,
// 			ext.RPCServerOption(wireCtx))
// 		defer serverSpan.Finish()
// 		c.Request = c.Request.WithContext(opentracing.ContextWithSpan(c.Request.Context(), serverSpan))
// 		c.Next()
// 	}
// }

// type LogrusAdapter struct{}

// func (l LogrusAdapter) Error(msg string) {
// 	log.Errorf(msg)
// }

// func (l LogrusAdapter) Infof(msg string, args ...interface{}) {
// 	log.Infof(msg, args)
// }


func main() {

{{#if addServices}}
	services.Init()
{{/if}}
	log.SetFormatter(&log.JSONFormatter{})
	log.SetOutput(os.Stdout)

	// Adding Route Counter via Prometheus Metrics
	counter := prometheus.NewCounterVec(prometheus.CounterOpts{
		Namespace: "counters",
		Subsystem: "page_requests",
		Name:      "request_count",
		Help:      "Number of requests received",
	}, []string{"Route", "Method"})
	prometheus.MustRegister(counter)

	// Hystrix configuration
	hystrix.ConfigureCommand("timeout", hystrix.CommandConfig{
		Timeout: 1000,
		MaxConcurrentRequests: 100,
		ErrorPercentThreshold: 25,
	})
	//Add Hystrix to prometheus metrics
	collector := plugins.InitializePrometheusCollector(plugins.PrometheusCollectorConfig{
		Namespace: "{{sanitizedName}}",
	})
	metricCollector.Registry.Register(collector.NewPrometheusCollector)

	//And jaeger metrics and reporting to prometheus route
	// logAdapt := LogrusAdapter{}
	// factory := jaegerprom.New()
	// metrics := jaeger.NewMetrics(factory, map[string]string{"lib": "jaeger"})

	// Add tracing to application
	// transport, err := jaeger.NewUDPTransport("localhost:5775", 0)
	// if err != nil {
	// 	log.Errorln(err.Error())
	// }

	// reporter := jaeger.NewCompositeReporter(
	// 	jaeger.NewLoggingReporter(logAdapt),
	// 	jaeger.NewRemoteReporter(transport,
	// 		jaeger.ReporterOptions.Metrics(metrics),
	// 		jaeger.ReporterOptions.Logger(logAdapt),
	// 	),
	// )
	// defer reporter.Close()

	// sampler := jaeger.NewConstSampler(true)
	// tracer, closer := jaeger.NewTracer("{{sanitizedName}}",
	// 	sampler,
	// 	reporter,
	// 	jaeger.TracerOptions.Metrics(metrics),
	// )
	// defer closer.Close()

	// opentracing.SetGlobalTracer(tracer)

	router := gin.Default()
	router.RedirectTrailingSlash = false

	router.Use(RequestTracker(counter))
	// router.Use(OpenTracing())
	router.Use(HystrixHandler("timeout"))

	router.GET("/metrics", gin.WrapH(promhttp.Handler()))
{{#ifCond applicationType '===' 'BLANK'}}
	{{#ifCond resourceType '!==' 'undefined'}}
	router.Use(static.Serve("/", static.LocalFile("./public", false)))
    {{#each resources}}
    {[this}}
    {{/each}}

	router.GET("/explorer", routers.SwaggerExplorerRedirect)
	router.GET("/swagger/api", routers.SwaggerAPI)
	router.Use(static.Serve("/explorer/", static.LocalFile("./public/swagger-ui/", true)))
	{{/ifCond}}
	{{#ifCond resourceType '===' 'undefined'}}
	router.Use(static.Serve("/", static.LocalFile("./public", false)))
	router.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "You are now running a blank Go application")
	})
    {{/ifCond}}
{{/ifCond}}
{{#ifCond applicationType '===' 'MS'}}
	router.GET("/explorer", routers.SwaggerExplorerRedirect)
	router.GET("/swagger/api", routers.SwaggerAPI)
	router.Use(static.Serve("/explorer/", static.LocalFile("./public/swagger-ui/", true)))
{{/ifCond}}
{{#ifCond applicationType '===' 'WEBAPP'}}
	router.LoadHTMLGlob("public/*.html")
	router.Use(static.Serve("/", static.LocalFile("./public", false)))
	router.GET("/", routers.Index)
	router.NoRoute(routers.NotFoundError)
	router.GET("/500", routers.InternalServerError)
{{/ifCond}}
{{#ifCond resourceType '===' 'undefined'}}
	router.GET("/health", routers.HealthGET)
{{/ifCond}}
{{#ifCond parsedSwaggerInfo.health '===' 'undefined'}}
	router.GET("/health", routers.HealthGET)
{{/ifCond}}

	log.Info("Starting {{name}} on port " + port())

	router.Run(port())
}