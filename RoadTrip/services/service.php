<?php 
$apikey = "jpa5r23f78vun3btzjvvwmk5";

if($_GET['action'] == 'getlocation') {
	print GetLocation($_GET['search'], $_GET['lat'], $_GET['lng']);
}

function GetLocation($search, $lat, $lng) {
	$url = sprintf("http://api.yellowapi.com/FindBusiness/?pg=1&what=%s&where=cZ%s,%s&pgLen=5&fmt=JSON&UID=%s&apikey=%s",
		$search, $lat, $lng, $apikey);
	$response = http_get($url);
	return $response;
}
?>
