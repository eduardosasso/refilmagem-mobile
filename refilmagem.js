$.YQL = function(url, callback) {
 
	query = 'select * from json where url="' + url + '"';

    var encodedQuery = encodeURIComponent(query.toLowerCase()),
        url = 'http://query.yahooapis.com/v1/public/yql?q='
            + encodedQuery + '&format=json&callback=?';
 
    $.getJSON(url, callback);
 
};

show_proximas_sessoes = function(cidade) {
	var url = "http://beta.refilmagem.com.br/api/proximas-sessoes/" + cidade;
	
	$.YQL(url, function(data) {
	    sessoes =  data.query.results.json.nodes;
		
		// if (data.query.count == 1) {
		// 	console.log(sessoes.title);
		// 	return false;
		// };
	
		$.each(sessoes, function(i,item) {
			sessao = item.hora + " › " + item.title;
			class_ = cidade + " " + item.hora;
			$('#proximas-sessoes ul').append('<li class="arrow"><a href="#cinemas" id="' + item.nid + ' " class="'+ class_ + '">' + sessao +'</a></li>');
		});
	
	});
}

show_cinemas_filme = function(nid, cidade, horario){
	url = "http://beta.refilmagem.com.br/api/filme-cinemas/" + nid + "/" + cidade + "/" + horario;
	
	$.YQL(url, function(data) {
		console.log(data);
	    cinemas =  data.query.results.json.nodes
			console.log(cinemas.length);
	
		if ($.isArray(cinemas) == false) {
			$('#cinemas ul').append('<li>' + cinemas.node_node_data_field_ref_cinema_title + '</li>');
			return false;
		};

		$.each(cinemas, function(i,item) {
			$('#cinemas ul').append('<li>' + item.node_node_data_field_ref_cinema_title + '</li>');
		});
	
	});
	
}

get_cidades = function(){
	var url = "http://beta.refilmagem.com.br/api/cidades";

	$.YQL(url, function(data) {
	    cidades =  data.query.results.json.nodes;
	
		$.each(cidades, function(i,item) {
			$('#home ul').append('<li class="arrow"><a href="#proximas-sessoes" id="' + item.tid + '">' + item.term_data_name +'</a></li>');

		});
	
	});
	
}
jQuery(document).ready(function($) {
	get_cidades();
	
	$('#cidades li a').live('click', function(){
		cidade = $(this).attr('id');

		$('#proximas-sessoes ul').empty();
		show_proximas_sessoes(cidade);
		
		//console.log($(this).attr('id'));
	});
	
	$('#proximas-sessoes ul li a').live('click', function(){
		$('#cinemas h1').text($(this).text());

		nid = $(this).attr('id');
		args = $(this).attr('class');
		
		args = args.split(' ');

		$('#cinemas ul').empty();
		show_cinemas_filme(nid, args[0], args[1]);

		//console.log($(this).attr('id'));
	});
	
	
});
