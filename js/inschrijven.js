
function schrijf_in(form){
    console.log(form);
    mutation_query = `mutation RegisterVisitor($input: RegisterVisitorCommand = {username: "",screenName: ""}) {
    		User {
    			register(input: $input){
    				correlationId
    			}
    		}
    	}`;
    Draftsman.mutation(mutation_query,(data,errors) => {
        console.log(data);
        console.log(errors);
    },variables={"input" : {
        "username" : form.email,
        "screenName" : form.voornaam + " " + form.achternaam
    }},anonymous=true);
}