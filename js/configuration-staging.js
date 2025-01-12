if (localStorage["staging-environment"] && localStorage["staging-environment"] == "true"){
	console.log("Connected to staging");
	stage = "staging";
	bucket = "d4l7tbodaraay.cloudfront.net";
	localStorage["aws-congnito-user-pool-id"] = "eu-central-1_DkbPGBi2e";
	localStorage["aws-congnito-app-id"] = "4h2hq2jpunrm2gbcd5rc1ob8k2";
	localStorage["aws-congnito-ui"] = "https://dms-staging.auth.eu-central-1.amazoncognito.com";	api_url = "https://slpepofxzjei3gjw6sklk5z4si.appsync-api.eu-central-1.amazonaws.com/graphql";
	api_ws = "wss://slpepofxzjei3gjw6sklk5z4si.appsync-realtime-api.eu-central-1.amazonaws.com/graphql";
	api_key = "da2-fz3fopwe4nfsnk7mnrzxxyuitq";
}