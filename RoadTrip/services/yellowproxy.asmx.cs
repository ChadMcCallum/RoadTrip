using System.Web;
using System.Web.Services;
using System.Web.Script.Services;
using System.Net;
using System.Threading;
using System;

namespace RoadTrip.services
{
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    [ScriptService]
    public class yellowproxy : System.Web.Services.WebService
    {
        private Random r;
        public yellowproxy()
        {
            r = new Random();
        }

        [WebMethod]
        public string HelloWorld()
        {
            return "Hello World";
        }

        [WebMethod]
        [ScriptMethod(ResponseFormat=ResponseFormat.Json)]
        public string GetBusinessTypesAtLocation(string search, double lat, double lng)
        {
            WebClient client = new WebClient();
            var userid = r.Next();
            lng = lng*-1;
            var address = string.Format("http://api.yellowapi.com/FindBusiness/?what={0}&where=cZ{1},{2}&apikey=jpa5r23f78vun3btzjvvwmk5&UID={3}&fmt=json", search, lng, lat, userid);
            var result = client.DownloadString(address);
            return result;
        }
    }
}
