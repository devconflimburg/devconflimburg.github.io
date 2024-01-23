if (localStorage["staging-environment"] && localStorage["staging-environment"] == "true"){
	console.log("Connected to staging")
	localStorage["aws-congnito-user-pool-id"] = "eu-central-1_DkbPGBi2e";
	localStorage["aws-congnito-app-id"] = "bmn1tkt5uoc6jopumotfcs310";
	api_url = "https://446q7mzyg5eclktd2fsdh3vbhq.appsync-api.eu-central-1.amazonaws.com/graphql";
	api_ws = "wss://446q7mzyg5eclktd2fsdh3vbhq.appsync-realtime-api.eu-central-1.amazonaws.com/graphql";
	api_key = "da2-tngt7pwhwjbgtbpticb4275qtu";
}