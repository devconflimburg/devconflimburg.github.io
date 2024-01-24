# devConf website

- Gebruik python om een dev server te starten.
- Gebaseerd op [dit template](https://startbootstrap.com/template/modern-business)
- Maakt gebruik van bootstrap 5 voor opmaak.
- Gebruikt [alpinejs](https://alpinejs.dev/) data & behavior binding.
- Gebruikt [vimesh-ui](https://github.com/vimeshjs/vimesh-ui) voor het definieren/laden van ui componenten.
- UI componenten staan in de components folder
- In het [configuratie script](/js/configuration.js) staat de dynamische content en feature toggles.
- Start de development server middels het python script: 
    - Windows:      py dev-server.py
    - Mac/Linux:    python dev-server.py
- Op het path "/appsync" wordt GraphiQL gehost om met de devConf API te interacteren (staging omgeving)  

## Github pages hosting
De site wordt gehost door Github Pages: [https://devconflimburg.github.io/](https://devconflimburg.github.io/)
Een push naar de main branch wordt automatisch gedeployed, zodra de pagina prd ready is 
kan ons eigen domein ervoor gezet worden. 
