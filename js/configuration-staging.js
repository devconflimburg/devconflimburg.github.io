if (localStorage["staging-environment"] && localStorage["staging-environment"] == "true"){
	console.log("Connected to staging");
	stage = "staging";
	bucket = "d1ltfpqfbu3vb6.cloudfront.net";
	localStorage["aws-congnito-user-pool-id"] = "eu-central-1_DBjWIiyoC";
	localStorage["aws-congnito-app-id"] = "1ukgkef1vih5vpersncirt2kt5";
	localStorage["aws-congnito-ui"] = "https://dms-staging-oavixm.auth.eu-central-1.amazoncognito.com";	api_url = "https://auowflerkjgvldafa36nj35e3y.appsync-api.eu-central-1.amazonaws.com/graphql";
	api_ws = "wss://auowflerkjgvldafa36nj35e3y.appsync-realtime-api.eu-central-1.amazonaws.com/graphql";
	api_key = "da2-s6liefunibfn5bfzmny6bdafhm";
}