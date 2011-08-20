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

        [WebMethod]
        [ScriptMethod(ResponseFormat=ResponseFormat.Json)]
        public string GetBusinessReviews(string name, string address)
        {
            WebClient client = new WebClient();

            //http://api.yelp.com/business_review_search?term=cream%20puffs&location=650%20Mission%20St%2ASan%20Francisco%2A%20CA&ywsid=XXXXXXXXXXXXXXXX
            var url = string.Format("http://api.yelp.com/business_review_search?term={0}&location={1}&ywsid=hcTM5_luivTPrXlsttKMHQ", name, address);
            var result = client.DownloadString(url);
            return result;
        }

        [WebMethod]
        [ScriptMethod]
        public string GetGasPrice(double lat, double lng)
        {
            WebClient client = new WebClient();
            ///stations/radius/47.9494949/120.23423432/distance/reg|mid|pre|diesel/price|distance/apikey.json?callback=?

            var url = string.Format("http://devapi.mygasfeed.com/stations/radius/{0}/{1}/5/reg/distance/rfej9napna.json", lat, lng);
            var result = client.DownloadString(url);
            return result;
        }
    }
}
