var api_url = "";
var api_ws = "";
var api_key = "";

if (!localStorage["staging-environment"] || localStorage["staging-environment"] == "false"){
	console.log("Connected to production")
	localStorage["aws-congnito-user-pool-id"] = "eu-central-1_HNt1QehSI";
	localStorage["aws-congnito-app-id"] = "464mjnisild08l6cvvga00cho8";
	api_url = "https://xvy5vktksjd37mgdfaoyo7nlaq.appsync-api.eu-central-1.amazonaws.com/graphql";
	api_ws = "wss://xvy5vktksjd37mgdfaoyo7nlaq.appsync-realtime-api.eu-central-1.amazonaws.com/graphql";
	api_key = "da2-j3s3mfbp3ba47mo5ov6hcmvyuq";
}