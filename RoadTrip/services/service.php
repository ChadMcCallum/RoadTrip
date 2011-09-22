<?php 

if($_GET['action'] == 'getlocation') {
	GetLocation($_GET['search'], $_GET['lat'], $_GET['lng']);
}

function GetLocation($search, $lat, $lng) {
	$apikey = "jpa5r23f78vun3btzjvvwmk5";
	
	$url = sprintf("http://api.yellowapi.com/FindBusiness/?pg=1&what=%s&where=cZ%s,%s&pgLen=5&fmt=JSON&UID=%s&apikey=%s",
		$search, $lat, $lng, $_SERVER['REMOTE_ADDR'], $apikey);

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	
	$result = curl_exec($ch);
	
	curl_close($ch);
	
	print $result;
}
?>