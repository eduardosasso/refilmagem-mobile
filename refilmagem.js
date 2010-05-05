String.prototype.trunc = function(n){
	return this.substr(0,n-1)+(this.length>n?' <a href="#" id="sinopse_completa">...Mais</a>':'');
};

var rfmg = {
	url : "http://refilmagem.com.br",

	request: function(url, callback) {
		query = 'select * from json where url="' + url + '"';

		var encodedQuery = encodeURIComponent(query.toLowerCase()),
		_url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodedQuery + '&format=json&callback=?';

		$.getJSON(_url, callback);
	},
	
	nome_cidade_coords: function(lat, lon, callback){
		var _this = this;

		query = "select locality1 from geo.places where woeid in (select place.woeid from flickr.places where lat='"+ lat +"' and lon='"+ lon +"')";

		var encodedQuery = encodeURIComponent(query.toLowerCase()),
		_url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodedQuery + '&format=json&callback=?';
		
		latlon = lat + ',' + lon;

		//_url = 'http://maps.google.com/maps/geo?q='+ latlon + '&output=json&sensor=true&key=ABQIAAAAm_U5X3msZlIawwmBL471ORQT_8O4OvQyFtE47Y-QdJmYm5WEQRQNZtdpTT-nM5SMKeCF5Hxx0pf0KQ&callback=?';

		$.getJSON(_url, function(data){
			//cidade = data.Placemark[0].AddressDetails.Country.AdministrativeArea.Locality.LocalityName;
			cidade = data.query.results.place.locality1.content;
			callback.call(_this, cidade);
		});
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

					telefone = item.node_node_data_field_ref_cinema_node_data_field_telefone_field_telefone_value;
					site = item.node_node_data_field_ref_cinema_node_data_field_url_field_url_value;
					
					var cinema = {  
					  	nid : item.node_node_data_field_ref_cinema_nid,
						nome : item.node_node_data_field_ref_cinema_title,
						endereco : item.node_node_data_field_ref_cinema__node_revisions_body,
						telefone: telefone,
						site: site,
					};
					
					_cinemas.push(cinema);
					
					cinema_anterior = cinema.nid;
				});

				callback.call(_this, _cinemas);
			});	
	},
	
	get_node: function(nid, callback) {
		var _this = this;

		params = {
			method: "node.get", 
			nid: nid
		}

		rfmg.service_request(params, function(result) {
			node = result.data;

			callback.call(_this, node);
		});		
	},
	
	filme: function(nid, callback) {
		var _this = this;
		
		params = {
			method: "views.get", 
			view_name: "filme", 
			display_id: 'default',
			args: [nid]
		}
		
		rfmg.service_request(params, function(result) {
			filmes = result.data;

			callback.call(_this, filmes);
		});
	},
	
	filmes_em_cartaz: function(callback) {
		var _this = this;
		
		params = {
			method: "views.get", 
			view_name: "frontpage", 
			display_id: 'block_1',
			args: [cidade]
		}
		
		rfmg.service_request(params, function(result) {
			filmes = result.data;

			callback.call(_this, filmes);
		});		
	},
	
	estreias_da_semana: function(cidade, callback) {
		var _this = this;
		
		params = {
			method: "views.get", 
			view_name: "frontpage", 
			display_id: 'default',
			args: [cidade,cidade]
		}
		
		rfmg.service_request(params, function(result) {
			filmes = result.data;

			callback.call(_this, filmes);
		});		
	},
	
	filmes_em_cartaz: function(cidade, callback) {
		var _this = this;
		
		params = {
			method: "views.get", 
			view_name: "frontpage", 
			display_id: 'block_1',
			args: [cidade]
		}
		
		rfmg.service_request(params, function(result) {
			filmes = result.data;

			callback.call(_this, filmes);
		});		
	},
	
	horarios_filme: function(movie_id_name, cidade, callback) {
		var _this = this;
		
		params = {
			method: "views.get", 
			view_name: "horarios_filme", 
			display_id: 'default',
			args: [movie_id_name, cidade]
		}
		
		var cinema = new Object();
		
		//var horarios_cinema = new Array(); 
		
		var horarios = new Array(); 
		
		var cinema_id_anterior = '';
		
		rfmg.service_request(params, function(result) {
			$.each(result.data, function(index, val) {
				cinema_id = val.node_node_data_field_ref_cinema_nid;		
				cinema_nome = val.node_node_data_field_ref_cinema_title;
				horario = val.node_data_field_horario_field_horario_value;
				endereco = val.node_node_data_field_ref_cinema__node_revisions_body;
				telefone = val.node_node_data_field_ref_cinema_node_data_field_telefone_field_telefone_value;
				site = val.node_node_data_field_ref_cinema_node_data_field_url_field_url_value;
				
				if (cinema_id_anterior == cinema_id) {
					cinema.horario.push(horario);
				} else {
					cinema = new Object();
					cinema.id = cinema_id;
					cinema.nome = cinema_nome;
					cinema.endereco = endereco,
					cinema.site = site,
					cinema.telefone = telefone,
					cinema.horario = new Array(horario);
					
					horarios.push(cinema);
				}
				
				cinema_id_anterior = cinema_id;
				
			});
			
			callback.call(_this, horarios);
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
	
	proximas_sessoes_near_by: function(cinemas, callback) {
		var _this = this;
		
		url = rfmg.url + "/api/proximas-sessoes-cinemas/" + cinemas + "&callback=?";
		
		$.getJSON(url, function(result){
			sessoes =  result.nodes;
			callback.call(_this, sessoes);			
		});
	},
	
	distancia: function(endereco_inicio, endereco_fim, callback) {
	 	var _this = this;
		endereco_fim = $('<div/>').html(endereco_fim).text(); 
		
		var google_maps_url = "http://maps.google.com/maps/nav?key=ABQIAAAAm_U5X3msZlIawwmBL471ORQT_8O4OvQyFtE47Y-QdJmYm5WEQRQNZtdpTT-nM5SMKeCF5Hxx0pf0KQ&output=json&sensor=false&oe=iso-8859-1&q=";
		var google_maps = google_maps_url;
		google_maps += "from:" + escape(endereco_inicio + ' ');
		google_maps += "to:" + escape(endereco_fim);
		google_maps += "&callback=?"; 
		
		$.getJSON(google_maps,function(data){
			//se na primeira tentativa nao conseguir pegar a distancia eh pq o endereco ta bixado entao tenta consertar pelo google mesmo
			if (data.Status.code != 200) {
				endereco_errado = $('<div/>').html(endereco_fim).text(); 

				//url_ = 'http://maps.google.com/maps/api/geocode/json?address=' + escape(endereco_fim) + '&sensor=false&output=json&callback=?';
				url_ = 'http://maps.google.com/maps/geo?key=ABQIAAAAm_U5X3msZlIawwmBL471ORQT_8O4OvQyFtE47Y-QdJmYm5WEQRQNZtdpTT-nM5SMKeCF5Hxx0pf0KQ&q=' + endereco_errado + '&oe=iso-8859-1&sensor=false&output=json&callback=?';
				
				//http://maps.google.com/maps/api/geocode/json?address=Av.%20Assis%20Brasil,%203522,%20Porto%20Alegre%20-%20RS,%2091010-003%20&sensor=false
				//http://maps.google.com/maps/api/geocode/json?latlng=40.714224,-73.961452&sensor=false
				
				//reverso
				//http://maps.google.com/maps/geo?q=40.714224,-73.961452&output=json&sensor=true_or_false&key=your_api_key
				
				$.getJSON(url_,function(result){
					
					if (result.Status.code == 200) {
						endereco_correto = result.Placemark[0].address;

						gm_url = google_maps_url;
						gm_url += "from:" + escape(endereco_inicio + ' ');
						gm_url += "to:" + escape(endereco_correto);
						gm_url += "&callback=?";

						$.getJSON(gm_url,function(datax){
							callback.call(_this,datax);
						});
					} else {
						callback.call(_this,data);
					}
					
				});
			} else {
				callback.call(_this,data);
			}			
		});	
	},
	
	ordena_por_proximidade: function(cinemas, campo_endereco, onde_estou, callback) {
		var _this = this;		

		if (view.minha_cidade().latlon == null) {
			callback.call(_this,cinemas);
			return;
		};

		var z = 0;
		
		$.each(cinemas, function(key, cinema) { 
			endereco = eval('cinema.' + campo_endereco);
			rfmg.distancia(onde_estou, endereco, function(distancia){
				//todo 602 nao vem com metros, fazer nova chamada para pegar o endereco certo
				if (distancia.Status.code == 200) {
					cinema.distancia = parseInt(distancia.Directions.Distance.meters);
					cinema.dtempo = distancia.Directions.summaryHtml;
					cinema.dtempo = cinema.dtempo.replace('&nbsp;', ' ');
				} else {
					//se por acaso nao vier com a distancia seta uma alta...
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
			latlon: onde_estou	
		}
	},
	
	grava_cache: function(name){
		if ($('body').data(name)) {
			return true;
		}
		
		$('body').data(name, true);
	},
	
	limpa_cache: function(name){
		$('body').data(name, false);
	},
	
	cidades: function(){
		view.loaderVisible(true);
		if (view.grava_cache('cidades')) {
	        view.loaderVisible(false);
			return;
		}

		var cidade_padrao = false;
		
		rfmg.cidades(function(cidades){
			var ativo ='';
			$.each(cidades, function(index, _cidade) {
				ativo = '';
				cidade_padrao = false;
				if (_cidade.tid == cidade) {
					cidade_padrao = true;
				} 	
				
				anchor = $('<a/>', {  
					id: _cidade.tid,
					href: '#home',  
					text: _cidade.term_data_name
				});
				
				list_item = $('<li/>').attr('class','arrow').append(anchor);
				
				if (cidade_padrao) {
					anchor.wrap('<span class="cidade_default" />');
				}

				$('#cidades ul').append(list_item);				
			});
			
			view.loaderVisible(false);

			//trocar por TAP depois
			$('#cidades ul li a').click(function(){
				//marca a cidade atual
				$('#cidades ul li span.cidade_default').removeClass('cidade_default');

				$(this).wrap('<span class="cidade_default"/>');
				
				cidade_id = $(this).attr('id');
				nome = $(this).text();
				
				view.set_minha_cidade(cidade_id,nome);
				
				view.limpa_cache('cinemas');
				view.limpa_cache('cinema');
				view.limpa_cache('filmes_em_cartaz');
			});

		});
	},
	
	filme: function(nid) {
		view.loaderVisible(true);
		
		$('#poster img').remove();
		$('#poster').addClass('loading');

		$('#horarios, #sinopse, #resto_sinopse, #estrelas, #detalhes p').empty();
		$('#titulo_original, #tempo, #classificacao, #genero, #formato, #trailer, #trailer_label').hide();
		
		rfmg.filme(nid, function(filme){
			filme = filme[0];
			
			nome = filme.node_title;
			nome = nome.replace('(dublado)','');

			tempo = filme.node_data_field_idade_field_tempo_value;
			idade = filme.node_data_field_idade_field_idade_value;
			trailer = filme.node_data_field_trailer_field_trailer_value;
			pre_estreia = filme.node_data_field_idade_field_pre_estreia_api_value;
			estreia = filme.node_data_field_idade_field_estreia_api_value;
			titulo_original = filme.node_data_field_idade_field_original_title_value;
			site = filme.node_data_field_url_field_url_value;
			movie_id_name = filme.node_data_field_idade_field_movie_id_name_value;
			lingua = filme.term_data_node_1_name;
			genero = filme.term_data_node_name;
			estrelas = filme.votingapi_cache_node_percent_vote_average_value;
			sinopse = view.strip_html(filme.node_revisions_body);
			sinopse_full = sinopse;
			sinopse = sinopse.trunc(120);
			poster = filme.files_node_data_field_poster_filepath;
			poster_url = rfmg.url + '/sites/default/files/imagecache/iphone/' + poster;
			
			$('#filme h2').text(nome);
			
			if (pre_estreia != null) {
				pre_estreia = pre_estreia.split(",");

				if ($.inArray(cidade, pre_estreia) != -1) {
					pre_estreia = true;
					$('#filme h2').append('<br /><span class="detalhes_filme">(pre-estreia)</span>');
				};
			}
			
			if (estreia != null && pre_estreia == false) {
				estreia = estreia.split(",");

				if ($.inArray(cidade, estreia) != -1) {
					$('#filme h2').append('<br /><span class="detalhes_filme">(estreia)</span>');
				};
			}
			
			//faz as estrelas
			for (var i=0; i < 5; i++) {
				estrela = $('<div/>').css('width', '0%');
				
				if (estrelas >= 20) {
					estrela.css('width', '100%');
				} else if (estrelas > 0) {
					estrela.css('width', (100 - estrelas) + '%');
				}
				
				estrela = $('<div/>').addClass('estrela').append(estrela);
				$('#estrelas').append(estrela);
				
				estrelas = (estrelas - 20);
			};
			
			rfmg.horarios_filme(movie_id_name, cidade, function(horarios) {
				rfmg.ordena_por_proximidade(horarios, 'endereco', onde_estou, function(data){
					$.each(horarios, function(index, val) {
						anchor = $('<a/>', {  
							id: val.id,
							href: '#',  
							text: val.nome,
							alt: val.telefone,
							title: val.endereco,
							rel: val.site,
							rev: val.dtempo,
						});

						list_item = $('<li/>').attr('class','arrow').append(anchor);

						ul_cinema = $('<ul/>').addClass('rounded nome_cinema').append(list_item);

						$('<div/>').addClass('cinema').attr('id', 'c' + val.id).append(ul_cinema).appendTo('#horarios');

						div = $('div#c' + val.id).append('<ul class="horarios_cinema"/>');

						$.each(val.horario, function(index, horario) {
							horafilme = new Date (new Date().toDateString() + ' ' + horario);
							hora = new Date();

							if (hora >= horafilme) {
								$('<li/>').addClass('movie_started').text(horario).appendTo($('ul:last', div));
							} else {
								$('<li/>').text(horario).appendTo($('ul:last', div));
							}
						});

						$('<li/>').text('.').addClass('clear').appendTo($('ul:last', div));
					});

					view.loaderVisible(false);

					$('#horarios ul li a').click(function(){
						id = $(this).attr('id');
						nome = $(this).text();
						endereco = $(this).attr('title');
						telefone = $(this).attr('alt');
						site = $(this).attr('rel');
						distancia = $(this).attr('rev');

						view.filmes_cinema(id, nome, endereco, telefone, site, distancia);

						jqt.goTo('#cinema');

						return false;						
					});
				});	
			});
			
			//$('#titulo_original').html(titulo_original);
			if (tempo) $('#tempo p').html(tempo).parent().show();
			if (idade) $('#classificacao p').html(idade).parent().show();
			if (genero) $('#genero p').html(genero).parent().show();
			if (lingua) $('#formato p').html(lingua).parent().show();
			
			$('#sinopse').html(sinopse);
			
			$('#sinopse_completa').click(function(){
				$('#sinopse').html(sinopse_full);
				return false;
			});

			var img = new Image();
			$(img).load(function(){
				$(this).hide();	

				$('#poster').removeClass('loading').append(this);

				$(this).fadeIn();
			}).attr('src', poster_url);
			
			video = jQuery.url.setUrl(trailer).attr("host");
			video_id = jQuery.url.param("v");
			
			if (video.search(/youtube/) >= 0) {
				$('#trailer_label').show();
				$('#trailer_label').html('<a href="#" id="trailer_link">Trailer</a>');
								
				$('#trailer_link').click(function(){
					$('#trailer').html('<embed src="http://www.youtube.com/v/' + video_id + '&hl=pt_BR&fs=1&" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="231" height="143"></embed>');
					$('#trailer').show();
					$('#trailer_label').text('Trailer');
					return false;
				});				
			} else {
				$('#trailer, #trailer_label').hide();
			}
		});
	},
	
	strip_html: function(string) { 
	    texto =  string.replace(/<(.|\n)*?>/g, ''); 
		texto = texto.replace(/\r\n\r\n/g, "</p><p>").replace(/\n\n/g, "</p><p>");
		texto = texto.replace(/\r\n/g, "<br />").replace(/\n/g, "<br />");
		return texto;
	},
	
	proximas_sessoes: function() {
		$('#proximas-sessoes ul').empty();
		$('#proximas-sessoes h2#nenhuma_sessao').remove();
		
        view.loaderVisible(true);
		
		var cinemas_proximos = new Array();
		
		if (view.minha_cidade().latlon != null) {
			rfmg.cinemas(cidade,function(cinemas){
				rfmg.ordena_por_proximidade(cinemas, 'endereco', onde_estou, function(data){
					$.each(data, function(index, val) {
						if (index >= 3) return true;
						cinemas_proximos.push(val.nid)
					});
					cinemas_proximos = cinemas_proximos.join(',');
					
					rfmg.proximas_sessoes_near_by(cinemas_proximos,function(horarios){
						if (horarios === undefined) {
							view.loaderVisible(false);	
							$('#proximas-sessoes').append('<h2 id="nenhuma_sessao">Nenhuma sessão por enquanto.</h2>');
							return;
						}
						
						$.each(horarios, function(i,item) {
							sessao = item.hora + " › " + item.filme;
							sessao = sessao + '<br /><span class="detalhes_filme">' + item.cinema + '</span>';
							class_ = cidade + " " + item.hora;

							anchor = $('<a/>', {  
								id: item.nid,
								alt: item.hora,
							    href: '#filme',  
							    html: sessao
							});

							list_item = $('<li/>').attr('class','arrow').append(anchor);
							$('#proximas-sessoes ul').append(list_item);
						});
						$('#proximas-sessoes h2').text("Próximas sessões aqui perto...");
						view.loaderVisible(false);
					});					
				});
			});			
		} else {
			rfmg.proximas_sessoes(cidade,function(sessoes){
				if (sessoes === undefined) {
					view.loaderVisible(false);	
					$('#proximas-sessoes').append('<h2 id="nenhuma_sessao">Nenhuma sessão por enquanto.</h2>');
					return;
				}

				$.each(sessoes, function(i,item) {
					sessao = item.hora + " › " + item.title;
					class_ = cidade + " " + item.hora;

					anchor = $('<a/>', {  
						id: item.nid,
						alt: item.hora,
						href: '#filme',  
						text: sessao
					});

					list_item = $('<li/>').attr('class','arrow').append(anchor);

					$('#proximas-sessoes ul').append(list_item);
					view.loaderVisible(false);
				});
			});
		}
	},
	
	filmes_cinema: function(cinema, nome, endereco, telefone, site, distancia){
		
		view.loaderVisible(true);
		
		$('#cinema ul, #cinema h2, #cinema #endereco_cinema').empty();
		$('#endereco_cinema').hide();
		
		if (telefone != 'null' && telefone != '') {
			endereco = endereco + '<span class="telefone">' + telefone + '</span>';
		};
		
		if (site != 'null' && site != '') {
			endereco = endereco + '<span class="site"><a href="'+ site + '">Site oficial</a></span>';
		};
		
		$('#cinema h2').text(nome);
		endereco = endereco.split(',');
		if (endereco[3] === undefined) {
			endereco[3] = '';
		} else {
			endereco[3] = ', ' + endereco[3]
		}
		endereco = endereco[0] + ', '+ endereco[1] + '<br />' + endereco[2] + endereco[3];
		
		if (distancia != 'null' && distancia != '') {
			endereco = endereco + '<span class="distancia">Distância: ' + distancia + '</span>';
		};
				
		$('#cinema #endereco_cinema').html(endereco);
		$('#endereco_cinema_label').show();
		
		rfmg.filmes_cinema(cinema, cidade, function(filmes){
			var detalhes_filme = new Array();
			
			$.each(filmes, function(index, filme) {
				nid = filme.node_node_data_field_ref_filme_nid;
				nome = filme.node_node_data_field_ref_filme_title;
				nome = nome.replace('(dublado)','');
				estreia = filme.node_node_data_field_ref_filme_node_data_field_estreia_api_field_estreia_api_value;
				pre_estreia = filme.node_node_data_field_ref_filme_node_data_field_estreia_api_field_pre_estreia_api_value;
				poster = filme.files_node_data_field_poster_filepath;
				lingua = filme.node_node_data_field_ref_filme__term_data_name;
				
				detalhes_filme = new Array()
				
				if (lingua == 'Dublado') {
					detalhes_filme.push('(dublado)');
				}
				
				if (pre_estreia != null) {
					pre_estreias = pre_estreia.split(",");

					if ($.inArray(cidade, pre_estreias) != -1) {
						detalhes_filme.push('(pre-estreia)');
						pre_estreia = true;
					};
				}
				
				if (estreia != null && pre_estreia == false) {
					estreias = estreia.split(",");

					if ($.inArray(cidade, estreias) != -1) {
						detalhes_filme.push('(estreia)');
					};
				}
				
				
				if (detalhes_filme.length > 0) {
					detalhes_filme = detalhes_filme.join(' ');
					detalhes_filme = '<br /><span class="detalhes_filme">' + detalhes_filme + '</span>';
				} else {
					detalhes_filme = '';
				}
				
				anchor = $('<a/>', {  
					id: nid,
				    href: '#filme',  
				    html: nome + detalhes_filme,
				});

				list_item = $('<li/>').attr('class','arrow').append(anchor);

				$('#cinema ul').append(list_item);
				view.loaderVisible(false);
				
			});
		})
	},
	
	filmes_em_cartaz: function(){
        view.loaderVisible(true);

		if (view.grava_cache('filmes_em_cartaz')) {
	        view.loaderVisible(false);
			return;
		}
		
		$('#filmes-em-cartaz ul').empty();
		
		var items_estreias = [];		
		rfmg.estreias_da_semana(cidade,function(estreias){
			if (estreias.length == 0) {
				$('#estreias_label, #lista_estreias').hide();
			} else {
				$('#estreias_label, #lista_estreias').show();

				$.each(estreias, function(index, estreia) {					
					detalhes_filme = new Array();
					
					pre_estreia = estreia.node_node_data_field_ref_filme_node_data_field_poster_field_pre_estreia_api_value;
					if (pre_estreia != null) {
						pre_estreia = pre_estreia.split(",");					
						if ($.inArray(cidade, pre_estreia) != -1) {
							detalhes_filme.push('(pre-estreia)');
						};
					};
					
					nome = estreia.node_node_data_field_ref_filme_title;
					nome = nome.replace('(dublado)','');

					if (estreia.node_node_data_field_ref_filme_title != nome) {
						detalhes_filme.push('(dublado)');
					};
					
					if (detalhes_filme.length > 0) {
						detalhes_filme = detalhes_filme.join(' ');
						detalhes_filme = '<br /><span class="detalhes_filme">'+ detalhes_filme + '</span>';
					} else {
						detalhes_filme = '';
					}

					//nome = '<span class="detalhes_filme">' + '</span>';
					anchor = $('<a/>', {  
						id: estreia.node_node_data_field_ref_filme_nid,
					    href: '#filme',  
					    html: nome + detalhes_filme,
					});

					list_item = $('<li/>').attr('class','arrow').append(anchor);
					items_estreias.push(list_item);
				});
				$.fn.append.apply($('#lista_estreias'), items_estreias);
			}
		});
		
		var items = [];

		rfmg.filmes_em_cartaz(cidade,function(filmes){
			$.each(filmes, function(index, filme) {
				nome = filme.node_node_data_field_ref_filme_title;
				nome = nome.replace('(dublado)','');
				
				dublado = '';
				
				if (filme.node_node_data_field_ref_filme_title != nome) {
					dublado = '<br /><span class="detalhes_filme">(dublado)</span>';
				};
				
				//nome = '<span class="detalhes_filme">' + '</span>';
				anchor = $('<a/>', {  
					id: filme.node_node_data_field_ref_filme_nid,
				    href: '#filme',  
				    html: nome + dublado,
				});
				
				list_item = $('<li/>').attr('class','arrow').append(anchor);
				
				items.push(list_item);
			});
			$('#filmes-em-cartaz h2:last').show();
			$.fn.append.apply( $('#lista_filmes_em_cartaz'), items);
			view.loaderVisible(false);
			
			//$('#lista_filmes_em_cartaz').append('<li>sss</li>');
		});
	},

	cinemas: function(){
        view.loaderVisible(true);
		if (view.grava_cache('cinemas')) {
	        view.loaderVisible(false);
			return;
		}
		$('#cinemas ul').empty();
		
		var items = [];
		rfmg.cinemas(cidade,function(cinemas){
			rfmg.ordena_por_proximidade(cinemas, 'endereco', onde_estou, function(data){
				$.each(data, function(index, cinema) {
					anchor = $('<a/>', {  
						id: cinema.nid,
					    href: '#',  
					    text: cinema.nome,
						title: cinema.endereco,
						alt: cinema.telefone,
						rel: cinema.site,
						rev: cinema.dtempo,
					});

					list_item = $('<li/>').attr('class','arrow').append(anchor);
					items.push(list_item);
				});				
				$.fn.append.apply( $('#cinemas ul'), items);
				//$('#cinemas ul').append(list_item);
		        view.loaderVisible(false);
		
				$('#cinemas ul li a').click(function(){
					id = $(this).attr('id');
					nome = $(this).text();
					endereco = $(this).attr('title');
					telefone = $(this).attr('alt');
					site = $(this).attr('rel');
					distancia = $(this).attr('rev');

					view.filmes_cinema(id, nome, endereco, telefone, site, distancia);
					
					jqt.goTo('#cinema');
					
					return false;						
				});
				
				
			});			
		});		
	},
	
	loaderVisible: function (visible) {
        if (visible) {
            $('#loader').css({
                'display': 'block'
            });
        } else {
            $('#loader').css('display', 'none');
        }
    },

	init: function(latlong, cidade){
		rfmg.cidade_meta(cidade,function(metadata){
			//se vier vazio eh pq a cidade no geo nao eh atendida pelo site
			if (metadata === undefined) {
				cidade_id = '231';
				cidade = 'São Paulo';
			} else {
				cidade_id = metadata.tid;
			}

			$('#home ul').show();
			$('#home h2').text(cidade);
			view.loaderVisible(false);

			view.set_minha_localizacao(latlong, cidade_id, cidade);

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
	},

}

var jqt = new $.jQTouch({
	useFastTouch: false,
    statusBar: 'black-translucent',
});

$(function (){
	if(navigator.onLine == true){ 
		//tenta recuperar a localizacao do usuario
		$('#home ul').hide();
		view.loaderVisible(true);	

		navigator.geolocation.getCurrentPosition(function(p) {
			latlong = p.coords.latitude + ',' + p.coords.longitude;
			rfmg.nome_cidade_coords(p.coords.latitude, p.coords.longitude, function(cidade){
				view.init(latlong,cidade);
			});
		}, 
		function(){
			cidade = 'São Paulo';
			view.init(null,cidade);
		});

		//para debug
		// cidade = 'Porto Alegre';
		// view.init('-30.02167427,-51.16154187',cidade);

		$('#home ul, #proximas-sessoes ul, #filmes-em-cartaz ul, #cinema ul, #cinemas ul').click(function(){
			view.loaderVisible(true);
		});

		$('#filme').bind('pageAnimationEnd', function(e, info){
			if (info.direction == 'out') return;

			ref = $(this).data('referrer');
			nid = ref.attr('id');

			view.filme(nid);
		});

		$('#filmes-em-cartaz').bind('pageAnimationEnd', function(e, info){
			if (info.direction == 'out') return;
			view.filmes_em_cartaz();
		});

		$('#home').bind('pageAnimationEnd', function(e, info){
			if (info.direction == 'out') return;
			$('h2', $(this)).text(view.minha_cidade().nome);
		});
		
		$('#endereco_cinema_label').click(function(){
			$('#endereco_cinema').show();
			$(this).hide();
			return false;
		});
		
	} else {
		$('#home h2').addClass('no-internet').html('Sem internet não funciona! :(');
		$('#home ul').hide();
	}	
});
