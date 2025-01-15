if (localStorage["staging-environment"] && localStorage["staging-environment"] == "true"){
	console.log("Connected to staging");
	stage = "staging";
	bucket = "dflrif08z6f0f.cloudfront.net";
	localStorage["aws-congnito-user-pool-id"] = "eu-central-1_DBjWIiyoC";
	localStorage["aws-congnito-app-id"] = "3knvvadsdc3lh8bldm0di2ub29";
	localStorage["aws-congnito-ui"] = "https://dms-staging-oavixm.auth.eu-central-1.amazoncognito.com";
	api_url = "https://xrvxjlqkwzhxbbf3d4q3v6yi3a.appsync-api.eu-central-1.amazonaws.com/graphql";
	api_ws = "wss://xrvxjlqkwzhxbbf3d4q3v6yi3a.appsync-realtime-api.eu-central-1.amazonaws.com/graphql";
	api_key = "da2-aj7zshshxbcvvnagqepkezmr7q";
}