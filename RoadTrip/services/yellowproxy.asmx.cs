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
                                              //api.yellowapi.com/FindBusiness/?pg=1&what=gas&lang=en&where=cZ-119.837308212876%2C50.7750245961957&pgLen=40&fmt=JSON&UID=qwer&apikey=jpa5r23f78vun3btzjvvwmk5
            var address = string.Format("http://api.yellowapi.com/FindBusiness/?pg=1&what={0}&lang=en&where=cZ{1},{2}&pgLen=5&fmt=JSON&UID={3}&apikey=jpa5r23f78vun3btzjvvwmk5", search, lng, lat, userid);
            var result = client.DownloadString(address);
            return result;
        }
    }
}
