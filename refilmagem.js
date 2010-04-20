var rfmg = {
	url : "http://beta.refilmagem.com.br/api/",
	
	request: function(url, callback) {

		query = 'select * from json where url="' + url + '"';

		var encodedQuery = encodeURIComponent(query.toLowerCase()),
		_url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodedQuery + '&format=json&callback=?';

		$.getJSON(_url, callback);
		
	},
	
	cinemas: function(cidade, callback){
		 	var _this = this;
		
			rfmg.url += cidade + "/cinemas";

			rfmg.request(rfmg.url, function(data) {
			    cinemas =  data.query.results.json.nodes;
			
				var _cinemas = new Array(); 

				$.each(cinemas, function(i,item) {
					var cinema = {  
					  	nid : item.node_node_data_field_ref_cinema_nid,
						nome : item.node_node_data_field_ref_cinema_title,
						endereco : item.node_node_data_field_ref_cinema__node_revisions_body,
					};
					
					_cinemas.push(cinema);
				});

				callback.call(_this, _cinemas);
			});	
	},
	
	get_distancia: function(endereco_inicio, endereco_fim, callback) {
	 	var _this = this;
	
		var google_maps = "http://maps.google.com/maps/nav?key=ABQIAAAAzr2EBOXUKnm_jVnk0OJI7xSosDVG8KKPE1-m51RBrvYughuyMxQ-i1QfUnH94QxWIa6N4U6MouMmBA&output=js&doflg=ptj&q=";
		google_maps += "from:" + escape(endereco_inicio + ' ');
		google_maps += "to:" + escape(endereco_fim);
		
		rfmg.request(google_maps, function(data) {
			result = data.query.results.json;
			// directions = result.Directions;
			//status = result.Status;
			
			 callback.call(_this,result);
		});	
	},
	
	cinemas_por_proximidade: function(cidade, onde_estou, callback) {
		var _this = this;		

		rfmg.cinemas(cidade,function(cinemas){
			var z = 0;
			
			$.each(cinemas, function(key, cinema) { 
				rfmg.get_distancia(onde_estou, cinema.endereco, function(distancia){
					//todo 602 nao vem com metros, fazer nova chamada para pegar o endereco certo
					if (distancia.Status.code == 200) {
						cinema.distancia = parseInt(distancia.Directions.Distance.meters);
					} else {
						cinema.distancia = parseInt(0);
					}
					
					z++;										
					//depois q pegou a distancia de todos os cinemas ordena e retorna
					if (z == cinemas.length ) {
						cinemas.sort(function(a,b){
							return a.distancia - b.distancia;
						});
						
						callback.call(_this,cinemas);	
					};
					
				});
			});
		});
	},

}


$(function (){
	onde_estou = '-29.9986925,-51.1487349';
	
	rfmg.cinemas_por_proximidade('porto-alegre',onde_estou, function(data){
		
		$.each(data, function(index, cinema) {
			anchor = $('<a/>', {  
				id: cinema.id,
			    href: '#cinema',  
			    text: cinema.nome  
			});
			
			list_item = $('<li/>').attr('class','arrow').append(anchor);
			
			$('#cinemas ul').append(list_item);
		});
		
	});
	//jqt.goTo($('#cinemas'));
});
