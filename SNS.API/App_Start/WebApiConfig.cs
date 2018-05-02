using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Formatting;
using System.Web.Http;
using System.Web.Http.Cors;
using Newtonsoft.Json;
using Microsoft.AspNet.WebApi.Extensions.Compression.Server;
using System.Net.Http.Extensions.Compression.Core.Compressors;

namespace SNS.API
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
         config.EnableCors(new EnableCorsAttribute("*", "*", "*"));
           
            // Web API routes
            config.MapHttpAttributeRoutes();

         config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{action}/{Param}",
                defaults: new { Param = RouteParameter.Optional }
            );

         //var jsonFormatter = config.Formatters.OfType<JsonMediaTypeFormatter>().First();
         //jsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

         var formatters = config.Formatters;
         formatters.Remove(formatters.XmlFormatter);

         var formatter = new JsonMediaTypeFormatter();
         var json = formatter.SerializerSettings;

         json.DateFormatHandling = Newtonsoft.Json.DateFormatHandling.IsoDateFormat;
         //json.Converters.Add(new Newtonsoft.Json.Converters.JavaScriptDateTimeConverter());
         json.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Local;
         json.NullValueHandling = Newtonsoft.Json.NullValueHandling.Include;
         json.Formatting = Newtonsoft.Json.Formatting.Indented;
         json.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
         json.Error = ( serializer, err ) =>
         {
            //if (System.Diagnostics.Debugger.IsAttached)
            //   {
            //   System.Diagnostics.Debugger.Break();
            //   }
         };

         config.Formatters.Insert(0, formatter);
         config.Filters.Add(new AuthorizeAttribute());
         GlobalConfiguration.Configuration.MessageHandlers.Insert(0, new ServerCompressionHandler(new GZipCompressor(), new DeflateCompressor()));
         }
    }
}
