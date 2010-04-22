var rfmg = {
	url : "http://beta.refilmagem.com.br/api/",
	
	request: function(url, callback) {

		query = 'select * from json where url="' + url + '"';

		var encodedQuery = encodeURIComponent(query.toLowerCase()),
		_url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodedQuery + '&format=json&callback=?';

		$.getJSON(_url, callback);
		
	},

	cidade_meta: function(cidade, callback) {
		var _this = this;
	
		url = rfmg.url + "cidades/" + escape(cidade);

		rfmg.request(url, function(data) {
		    metadata =  data.query.results.json.nodes;
			
			callback.call(_this, metadata);
		});	
		
	},
	
	cidades : function(callback){
		var _this = this;
	
		url = rfmg.url + "cidades";

		rfmg.request(url, function(data) {
		    cidades =  data.query.results.json.nodes;
			
			callback.call(_this, cidades);
		});	
	},
		
	cinemas: function(cidade, callback){
		 	var _this = this;
		
			url = rfmg.url + cidade + "/cinemas";

			rfmg.request(url, function(data) {
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
	
	proximas_sessoes: function(cidade, callback) {
		var _this = this;
		
		url = rfmg.url + "proximas-sessoes/" + cidade;

		rfmg.request(url, function(data) {
		    sessoes =  data.query.results.json.nodes;

			callback.call(_this, sessoes);
		});
	},
	
	
	distancia: function(endereco_inicio, endereco_fim, callback) {
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
				rfmg.distancia(onde_estou, cinema.endereco, function(distancia){
					//todo 602 nao vem com metros, fazer nova chamada para pegar o endereco certo
					if (distancia.Status.code == 200) {
						cinema.distancia = parseInt(distancia.Directions.Distance.meters);
					} else {
						cinema.distancia = parseInt(999990);
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

view = {
	onde_estou: '',
	cidade: '',
	nome_cidade: '',
	
	set_minha_localizacao: function(latlong, _cidade, _nome_cidade) {
		onde_estou = latlong;
		
		view.set_minha_cidade(_cidade, _nome_cidade);
	},
	
	set_minha_cidade: function(_cidade,_nome_cidade) {
		cidade = _cidade;
		nome_cidade = _nome_cidade;		
	},
	
	minha_cidade: function(){
		return {
			id: cidade,
			nome: nome_cidade,			
		}
	},
	
	cidades: function(){
		rfmg.cidades(function(data){
			$.each(data, function(index, cidade) {
				anchor = $('<a/>', {  
					id: cidade.tid,
					href: '#home',  
					text: cidade.term_data_name  
				});

				list_item = $('<li/>').attr('class','arrow').append(anchor);

				$('#cidades ul').append(list_item);				
			});

			//trocar por TAP depois
			$('#cidades ul li a').click(function(){
				cidade = $(this).attr('id');
				nome = $(this).text();
				
				view.set_minha_cidade(cidade,nome);				
			});

		});
	},
	
	proximas_sessoes: function() {
		rfmg.proximas_sessoes(cidade,function(sessoes){
			$.each(sessoes, function(i,item) {
				sessao = item.hora + " › " + item.title;
				class_ = cidade + " " + item.hora;
				
				anchor = $('<a/>', {  
					id: item.nid,
				    href: '#cinemas',  
				    text: sessao
				});

				list_item = $('<li/>').attr('class','arrow').append(anchor);
				
				$('#proximas-sessoes ul').append(list_item);
			});
		});
	},
	
	cinemas: function(){
		if ($('#cinemas ul#cinemas-proximos').length == 0) {
			$('#cinemas h2').before($('<ul/>').attr('id','cinemas-proximos'));
			$('#cinemas ul#cinemas-proximos').before('<h2>Mais próximos</h2>');
		};
		rfmg.cinemas_por_proximidade(cidade,onde_estou, function(data){

			$.each(data, function(index, cinema) {
				anchor = $('<a/>', {  
					id: cinema.nid,
				    href: '#cinema',  
				    text: cinema.nome  
				});

				list_item = $('<li/>').attr('class','arrow').append(anchor);

				if (index <= 4) {
					$('#cinemas ul#cinemas-proximos').append(list_item);
				} else {
					$('#cinemas ul:not(#cinemas-proximos)').append(list_item);
				}


			});

		});
	},
}

var jqt = new $.jQTouch({
	useFastTouch: false,
});

// Pega a localizacao do usuario e define latitudo, longitude e cidade. 
// Tem q validar se vem de uma cidade nao atendida.
var init = function(){
	geo_meta_url = "http://maps.google.com/maps/geo?sensor=false&q=";
	
	//arteplex
	// localizacao = '-30.02167427,-51.16154187';
	
	$('#home ul').hide();
	
	jqt.updateLocation(function(geo){
        if (geo) {
			latlong = geo.latitude + ',' + geo.longitude;
			
			geo_meta_url += latlong;
			
			rfmg.request(geo_meta_url,function(meta){
				cidade = meta.query.results.json.Placemark[0].AddressDetails.Country.AdministrativeArea.Locality.LocalityName;
				
				rfmg.cidade_meta(cidade,function(metadata){
					$('#home ul').show();
					$('#home h2').text(cidade);

					/*
						TODO tem q testar quando nao acha o tid, ou seja cidade nao atendida
					*/
					view.set_minha_localizacao(latlong, metadata.tid);
				});
				
			})			
        } else {
			$('#cinemas h2').text('Localização desconhecida');
        }
    });
	
}

$(function (){
	init();
	
	$('#home, #cidades, #cinemas, #proximas-sessoes').bind('pageAnimationEnd', function(e, info){
		if (info.direction == 'out') return;
		
		var $page = $(this);
		//if ($page.data('loaded')) return;
		
		id = $(this).attr('id');
		
		switch (id) {
			case 'home':			
			$('h2', $page).text(view.minha_cidade().nome);
			break;
			
			case 'cidades': 
			view.cidades();
			break;

			case 'cinemas': 
			view.cinemas();
			break;	
			
			case 'proximas-sessoes': 
			view.proximas_sessoes();
			break;	
		}
		
		$page.data('loaded', true);

	});
});
