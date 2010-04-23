var rfmg = {
	url : "http://beta.refilmagem.com.br",

	request: function(url, callback) {
		query = 'select * from json where url="' + url + '"';

		var encodedQuery = encodeURIComponent(query.toLowerCase()),
		_url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodedQuery + '&format=json&callback=?';

		$.getJSON(_url, callback);
	},
	
	service_request: function(data, callback) {
		url = rfmg.url + "/services/json/";
		
		$.ajax({
			type: 'GET',
			dataType: 'jsonp',
			url: url,
			data: data,
			success: callback
		});		
	},

	cidade_meta: function(cidade, callback) {
		var _this = this;
		
		params = {
			method: "views.get", 
			view_name: "lista_cidades", 
			display_id: "page_3",
			args: [cidade],
		}
	
		rfmg.service_request(params, function(result) {
		    metadata =  result.data[0];
			
			callback.call(_this, metadata);
		});	
	},
	
	cidades : function(callback){
		var _this = this;

		params = {
			method: "views.get", 
			view_name: "lista_cidades", 
			display_id: 'page_1'
		}
		
		rfmg.service_request(params, function(result) {
		    cidades = result.data;
			
			callback.call(_this, cidades);
		});	
	},
		
	cinemas: function(cidade, callback){
		 	var _this = this;
			
			params = {
				method: "views.get", 
				view_name: "cinemas", 
				display_id: 'default',
				args: [cidade]
			}

			rfmg.service_request(params, function(result) {
			    cinemas =  result.data;
			
				var _cinemas = new Array(); 
				var cinema_anterior = '';
				
				//cinemas vem repetidos por causa dos horarios entao tem q filtrar
				$.each(cinemas, function(i,item) {					
					if (cinema_anterior == item.node_node_data_field_ref_cinema_nid) {
						return true;
					};
					
					var cinema = {  
					  	nid : item.node_node_data_field_ref_cinema_nid,
						nome : item.node_node_data_field_ref_cinema_title,
						endereco : item.node_node_data_field_ref_cinema__node_revisions_body,
					};
					
					_cinemas.push(cinema);
					
					cinema_anterior = cinema.nid;
				});

				callback.call(_this, _cinemas);
			});	
	},
	
	filme_cinemas: function(filme, cidade, horario, callback) {
		var _this = this;
		
		params = {
			method: "views.get", 
			view_name: "filme_cinemas", 
			display_id: 'default',
			args: [filme, cidade, horario]
		}
		
		rfmg.service_request(params, function(result) {
		    cinemas = result.data;
			
			callback.call(_this, cinemas);
		});		
	},
	
	filmes_cinema: function(cinema, cidade, callback) {
		var _this = this;

		params = {
			method: "views.get", 
			view_name: "filmes_cinema", 
			display_id: 'default',
			args: [cinema, cidade]
		}

		rfmg.service_request(params, function(result) {
			filmes = result.data;

			callback.call(_this, filmes);
		});		
	},
	
	proximas_sessoes: function(cidade, callback) {
		var _this = this;
		
		url = rfmg.url + "/api/proximas-sessoes/" + cidade + "&callback=?";
		
		$.getJSON(url, function(result){
			sessoes =  result.nodes;
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
	
	ordena_por_proximidade: function(cinemas, campo_endereco, onde_estou, callback) {
		var _this = this;		
		var z = 0;
		
		$.each(cinemas, function(key, cinema) { 
			endereco = eval('cinema.' + campo_endereco);
			rfmg.distancia(onde_estou, endereco, function(distancia){
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
		//so carrega uma vez
		if ($(this).data('loaded')) return;

		$(this).data('loaded', true);	
		
		rfmg.cidades(function(cidades){
			var ativo ='';
			$.each(cidades, function(index, _cidade) {
				ativo = '';
				if (_cidade.tid == cidade) {
					ativo = 'default';
				} 	
				
				anchor = $('<a/>', {  
					id: _cidade.tid,
					href: '#home',  
					text: _cidade.term_data_name
				}).attr('class', ativo);

				list_item = $('<li/>').attr('class','arrow').append(anchor);

				$('#cidades ul').append(list_item);				
			});

			//trocar por TAP depois
			$('#cidades ul li a').click(function(){
				//marca a cidade atual
				$('#cidades ul li a').removeClass('default');
				$(this).addClass('default');
				
				cidade_id = $(this).attr('id');
				nome = $(this).text();
				
				view.set_minha_cidade(cidade_id,nome);				
			});

		});
	},
	
	proximas_sessoes: function() {
		$('#proximas-sessoes ul').empty();
		
		rfmg.proximas_sessoes(cidade,function(sessoes){
			$.each(sessoes, function(i,item) {
				sessao = item.hora + " › " + item.title;
				class_ = cidade + " " + item.hora;
				
				anchor = $('<a/>', {  
					id: item.nid,
					alt: item.hora,
				    href: '#cinemas',  
				    text: sessao
				});

				list_item = $('<li/>').attr('class','arrow').append(anchor);
				
				$('#proximas-sessoes ul').append(list_item);
			});
			
			$('#proximas-sessoes ul li a').click(function(){
				filme = $(this).attr('id');
				hora = $(this).attr('alt');
				
				rfmg.filme_cinemas(filme, cidade, hora, function(cinemas){					
					if (cinemas.length == 1) {
						cinema = cinemas[0];
						
						anchor = $('<a/>', {  
							id: cinema.node_node_data_field_ref_cinema_nid,
						    href: '#cinema',  
						    text: cinema.node_node_data_field_ref_cinema_title,
						});

						list_item = $('<li/>').attr('class','arrow').append(anchor);
						
						$('#cinemas ul').append(list_item);
						
					} else {
						endereco = 'node_node_data_field_ref_cinema__node_revisions_body';
						
						rfmg.ordena_por_proximidade(cinemas, endereco, onde_estou, function(data){
							$.each(data, function(index, cinema) {
								anchor = $('<a/>', {  
									id: cinema.node_node_data_field_ref_cinema_nid,
								    href: '#cinema',  
								    text: cinema.node_node_data_field_ref_cinema_title,
								});

								list_item = $('<li/>').attr('class','arrow').append(anchor);

								$('#cinemas ul').append(list_item);
							});
						});
					}
				});
			});
			
		});
	},
	
	filmes_cinema: function(cinema){
		rfmg.filmes_cinema(cinema, cidade, function(filmes){
			$.each(filmes, function(index, filme) {
				nid = filme.node_node_data_field_ref_filme_nid;
				nome = filme.node_node_data_field_ref_filme_title;
				nome = nome.replace('(dublado)','');
				estreia = filme.node_node_data_field_ref_filme_node_data_field_estreia_api_field_estreia_api_value;
				pre_estreia = filme.node_node_data_field_ref_filme_node_data_field_estreia_api_field_pre_estreia_api_value;
				poster = filme.files_node_data_field_poster_filepath;
				lingua = filme.node_node_data_field_ref_filme__term_data_name;
				
				if (lingua == 'Dublado') {
					lingua = '(dublado) ';
				} else {
					lingua = '';
				}
				
				anchor = $('<a/>', {  
					id: nid,
				    href: '#filme',  
				    text: nome,
				});

				list_item = $('<li/>').attr('class','arrow').append(anchor);
				
				if (estreia != null) {
					estreias = estreia.split(",");

					if ($.inArray(cidade, estreias) != -1) {
						anchor_estreia = $('<a/>', {  
							id: nid,
						    href: '#filme',  
						    text: lingua + '(estreia)',
						});
						
						list_item.append(anchor_estreia);
					};
				};
				
				if (pre_estreia != null) {
					pre_estreias = pre_estreia.split(",");

					if ($.inArray(cidade, pre_estreias) != -1) {
						anchor_pre_estreia = $('<a/>', {  
							id: nid,
						    href: '#filme',  
						    text: lingua + '(pre-estreia)',
						});
						
						list_item.append(anchor_pre_estreia);
					};
				};				

				$('#cinema ul').append(list_item);
				
			});
		})
	},

	cinemas: function(){
		rfmg.cinemas(cidade,function(cinemas){
			rfmg.ordena_por_proximidade(cinemas, 'endereco', onde_estou, function(data){
				$.each(data, function(index, cinema) {
					anchor = $('<a/>', {  
						id: cinema.nid,
					    href: '#cinema',  
					    text: cinema.nome,
					});

					list_item = $('<li/>').attr('class','arrow').append(anchor);

					$('#cinemas ul').append(list_item);
				});
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
					
					$('#home ul li a').click(function(e){
						id = $(this).attr('href');

						switch (id) {
							case '#cidades': 
							view.cidades();
							break;

							case '#cinemas': 
							view.cinemas();
							break;	

							case '#proximas-sessoes': 
							view.proximas_sessoes();
							break;	
						}
					});
				});
				
			})			
        } else {
			$('#cinemas h2').text('Localização desconhecida');
        }
    });
	
}

$(function (){
	init();
	
	$('#cinema').bind('pageAnimationEnd', function(e, info){
		if (info.direction == 'out') return;
		
		//recupera quem chamou a janela
		ref = $(this).data('referrer');
		nid = ref.attr('id');
		$('#cinema h2').text(ref.text());
		$('#cinema ul').empty();
		
		view.filmes_cinema(nid);
	});
	
	
	//sempre limpa a lista de cinemas quando entrar nessa tela
	$('#cinemas').bind('pageAnimationEnd', function(e, info){
		if (info.direction == 'out') return;
		//$('ul', $(this)).empty();
	});
	
	$('#home').bind('pageAnimationEnd', function(e, info){
		if (info.direction == 'out') return;
		$('h2', $(this)).text(view.minha_cidade().nome);
	});
});
