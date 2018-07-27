package routers

import (
  "github.com/gin-gonic/gin"
)

<% if (typeof routes !== 'undefined') {               -%>
<%   routes.forEach(function (route) {                -%>
<%     let path = route.route.capitalize();           -%>
<%     if (typeof basepath !== 'undefined') {         -%>
<%       path = basepath.capitalize() + route.route;  -%>
<%     }                                              -%>
<%     let funcName = path.replace(/\/:?([a-zA-Z])/g, function (g) { return g[g.length-1].toUpperCase(); }); -%>
<%     funcName = funcName + route.method.toUpperCase();   -%>
func <%- funcName %>(c *gin.Context){
  c.JSON(200, gin.H{})
}

<%   });                                                -%>
<% }                                                  -%>