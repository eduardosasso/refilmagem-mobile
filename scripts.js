jQuery.url=function(){var segments={};var parsed={};var options={url:window.location,strictMode:false,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};var parseUri=function(){str=decodeURI(options.url);var m=options.parser[options.strictMode?"strict":"loose"].exec(str);var uri={};var i=14;while(i--){uri[options.key[i]]=m[i]||""}uri[options.q.name]={};uri[options.key[12]].replace(options.q.parser,function($0,$1,$2){if($1){uri[options.q.name][$1]=$2}});return uri};var key=function(key){if(!parsed.length){setUp()}if(key=="base"){if(parsed.port!==null&&parsed.port!==""){return parsed.protocol+"://"+parsed.host+":"+parsed.port+"/"}else{return parsed.protocol+"://"+parsed.host+"/"}}return(parsed[key]==="")?null:parsed[key]};var param=function(item){if(!parsed.length){setUp()}return(parsed.queryKey[item]===null)?null:parsed.queryKey[item]};var setUp=function(){parsed=parseUri();getSegments()};var getSegments=function(){var p=parsed.path;segments=[];segments=parsed.path.length==1?{}:(p.charAt(p.length-1)=="/"?p.substring(1,p.length-1):path=p.substring(1)).split("/")};return{setMode:function(mode){strictMode=mode=="strict"?true:false;return this},setUrl:function(newUri){options.url=newUri===undefined?window.location:newUri;setUp();return this},segment:function(pos){if(!parsed.length){setUp()}if(pos===undefined){return segments.length}return(segments[pos]===""||segments[pos]===undefined)?null:segments[pos]},attr:key,param:param}}();;(function($){$.jQTouch=function(options){$.support.WebKitCSSMatrix=(typeof WebKitCSSMatrix=="object");$.support.touch=(typeof Touch=="object");$.support.WebKitAnimationEvent=(typeof WebKitTransitionEvent=="object");var $body,$head=$('head'),hist=[],newPageCount=0,jQTSettings={},hashCheckInterval,currentPage,orientation,isMobileWebKit=RegExp(" Mobile/").test(navigator.userAgent),tapReady=true,lastAnimationTime=0,touchSelectors=[],publicObj={},extensions=$.jQTouch.prototype.extensions,defaultAnimations=['slide','flip','slideup','swap','cube','pop','dissolve','fade','back'],animations=[],hairextensions='';init(options);function init(options){var defaults={addGlossToIcon:true,backSelector:'.back, .cancel, .goback',cacheGetRequests:true,cubeSelector:'.cube',dissolveSelector:'.dissolve',fadeSelector:'.fade',fixedViewport:true,flipSelector:'.flip',formSelector:'form',fullScreen:true,fullScreenClass:'fullscreen',icon:null,touchSelector:'a, .touch',popSelector:'.pop',preloadImages:false,slideSelector:'body > * > ul li a',slideupSelector:'.slideup',startupScreen:null,statusBar:'default',submitSelector:'.submit',swapSelector:'.swap',useAnimations:true,useFastTouch:true};jQTSettings=$.extend({},defaults,options);if(jQTSettings.preloadImages){for(var i=jQTSettings.preloadImages.length-1;i>=0;i--){(new Image()).src=jQTSettings.preloadImages[i];};}
if(jQTSettings.icon){var precomposed=(jQTSettings.addGlossToIcon)?'':'-precomposed';hairextensions+='<link rel="apple-touch-icon'+precomposed+'" href="'+jQTSettings.icon+'" />';}
if(jQTSettings.startupScreen){hairextensions+='<link rel="apple-touch-startup-image" href="'+jQTSettings.startupScreen+'" />';}
if(jQTSettings.fixedViewport){hairextensions+='<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;"/>';}
if(jQTSettings.fullScreen){hairextensions+='<meta name="apple-mobile-web-app-capable" content="yes" />';if(jQTSettings.statusBar){hairextensions+='<meta name="apple-mobile-web-app-status-bar-style" content="'+jQTSettings.statusBar+'" />';}}
if(hairextensions){$head.prepend(hairextensions);}
$(document).ready(function(){for(var i in extensions)
{var fn=extensions[i];if($.isFunction(fn))
{$.extend(publicObj,fn(publicObj));}}
for(var i in defaultAnimations)
{var name=defaultAnimations[i];var selector=jQTSettings[name+'Selector'];if(typeof(selector)=='string'){addAnimation({name:name,selector:selector});}}
touchSelectors.push('input');touchSelectors.push(jQTSettings.touchSelector);touchSelectors.push(jQTSettings.backSelector);touchSelectors.push(jQTSettings.submitSelector);$(touchSelectors.join(', ')).css('-webkit-touch-callout','none');$(jQTSettings.backSelector).tap(liveTap);$(jQTSettings.submitSelector).tap(submitParentForm);$body=$('body');if(jQTSettings.fullScreenClass&&window.navigator.standalone==true){$body.addClass(jQTSettings.fullScreenClass+' '+jQTSettings.statusBar);}
$body.bind('touchstart',handleTouch).bind('orientationchange',updateOrientation).trigger('orientationchange').submit(submitForm);if(jQTSettings.useFastTouch&&$.support.touch)
{$body.click(function(e){var $el=$(e.target);if($el.attr('target')=='_blank'||$el.attr('rel')=='external'||$el.is('input[type="checkbox"]'))
{return true;}else{return false;}});$body.mousedown(function(e){var timeDiff=(new Date()).getTime()-lastAnimationTime;if(timeDiff<200)
{return false;}});}
if($('body > .current').length==0){currentPage=$('body > *:first');}else{currentPage=$('body > .current:first');$('body > .current').removeClass('current');}
$(currentPage).addClass('current');location.hash='#'+$(currentPage).attr('id');addPageToHistory(currentPage);scrollTo(0,0);startHashCheck();});}
function goBack(to){var numberOfPages=Math.min(parseInt(to||1,10),hist.length-1),curPage=hist[0];if(isNaN(numberOfPages)&&typeof(to)==="string"&&to!='#'){for(var i=1,length=hist.length;i<length;i++){if('#'+hist[i].id===to){numberOfPages=i;break;}}}
if(isNaN(numberOfPages)||numberOfPages<1){numberOfPages=1;};if(hist.length>1)
{hist.splice(0,numberOfPages);animatePages(curPage.page,hist[0].page,curPage.animation,curPage.reverse===false);}
else
{location.hash='#'+curPage.id;}
return publicObj;}
function goTo(toPage,animation,reverse){var fromPage=hist[0].page;if(typeof(toPage)==='string'){toPage=$(toPage);}
if(typeof(animation)==='string'){for(var i=animations.length-1;i>=0;i--){if(animations[i].name===animation)
{animation=animations[i];break;}}}
if(animatePages(fromPage,toPage,animation,reverse)){addPageToHistory(toPage,animation,reverse);return publicObj;}
else
{console.error('Could not animate pages.');return false;}}
function getOrientation(){return orientation;}
function liveTap(e){var $el=$(e.target);if($el.attr('nodeName')!=='A'&&$el.attr('nodeName')!=='AREA'){$el=$el.closest('a, area');}
var target=$el.attr('target'),hash=$el.attr('hash'),animation=null;if(tapReady==false||!$el.length){console.warn('Not able to tap element.');return false;}
if($el.attr('target')=='_blank'||$el.attr('rel')=='external')
{return true;}
for(var i=animations.length-1;i>=0;i--){if($el.is(animations[i].selector)){animation=animations[i];break;}};if(target=='_webapp'){window.location=$el.attr('href');}
else if($el.is(jQTSettings.backSelector)){goBack(hash);}
else if(hash&&hash!='#'){$el.addClass('active');goTo($(hash).data('referrer',$el),animation,$(this).hasClass('reverse'));}else{$el.addClass('loading active');showPageByHref($el.attr('href'),{animation:animation,callback:function(){$el.removeClass('loading');setTimeout($.fn.unselect,250,$el);},$referrer:$el});}
return false;}
function addPageToHistory(page,animation,reverse){var pageId=page.attr('id');hist.unshift({page:page,animation:animation,reverse:reverse||false,id:pageId});}
function animatePages(fromPage,toPage,animation,backwards){if(toPage.length===0){$.fn.unselect();console.error('Target element is missing.');return false;}
$(':focus').blur();scrollTo(0,0);var callback=function animationEnd(event){if(animation)
{toPage.removeClass('in '+animation.name);fromPage.removeClass('current out '+animation.name);if(backwards){toPage.toggleClass('reverse');fromPage.toggleClass('reverse');}}
else
{fromPage.removeClass('current');}
toPage.trigger('pageAnimationEnd',{direction:'in'});fromPage.trigger('pageAnimationEnd',{direction:'out'});clearInterval(hashCheckInterval);currentPage=toPage;location.hash='#'+currentPage.attr('id');startHashCheck();var $originallink=toPage.data('referrer');if($originallink){$originallink.unselect();}
lastAnimationTime=(new Date()).getTime();tapReady=true;}
fromPage.trigger('pageAnimationStart',{direction:'out'});toPage.trigger('pageAnimationStart',{direction:'in'});if($.support.WebKitAnimationEvent&&animation&&jQTSettings.useAnimations){toPage.one('webkitAnimationEnd',callback);tapReady=false;if(backwards){toPage.toggleClass('reverse');fromPage.toggleClass('reverse');}
toPage.addClass(animation.name+' in current ');fromPage.addClass(animation.name+' out');}else{toPage.addClass('current');callback();}
return true;}
function hashCheck(){var curid=currentPage.attr('id');if(location.hash==''){location.hash='#'+curid;}else if(location.hash!='#'+curid){clearInterval(hashCheckInterval);goBack(location.hash);}}
function startHashCheck(){hashCheckInterval=setInterval(hashCheck,100);}
function insertPages(nodes,animation){var targetPage=null;$(nodes).each(function(index,node){var $node=$(this);if(!$node.attr('id')){$node.attr('id','page-'+(++newPageCount));}
$body.trigger('pageInserted',{page:$node.appendTo($body)});if($node.hasClass('current')||!targetPage){targetPage=$node;}});if(targetPage!==null){goTo(targetPage,animation);return targetPage;}
else
{return false;}}
function showPageByHref(href,options){var defaults={data:null,method:'GET',animation:null,callback:null,$referrer:null};var settings=$.extend({},defaults,options);if(href!='#')
{$.ajax({url:href,data:settings.data,type:settings.method,success:function(data,textStatus){var firstPage=insertPages(data,settings.animation);if(firstPage)
{if(settings.method=='GET'&&jQTSettings.cacheGetRequests===true&&settings.$referrer)
{settings.$referrer.attr('href','#'+firstPage.attr('id'));}
if(settings.callback){settings.callback(true);}}},error:function(data){if(settings.$referrer){settings.$referrer.unselect();}
if(settings.callback){settings.callback(false);}}});}
else if($referrer)
{$referrer.unselect();}}
function submitForm(e,callback){var $form=(typeof(e)==='string')?$(e):$(e.target);if($form.length&&$form.is(jQTSettings.formSelector)){showPageByHref($form.attr('action'),{data:$form.serialize(),method:$form.attr('method')||"POST",animation:animations[0]||null,callback:callback});return false;}
return true;}
function submitParentForm(e){var $form=$(this).closest('form');if($form.length)
{evt=jQuery.Event("submit");evt.preventDefault();$form.trigger(evt);return false;}
return true;}
function addAnimation(animation){if(typeof(animation.selector)=='string'&&typeof(animation.name)=='string'){animations.push(animation);$(animation.selector).tap(liveTap);touchSelectors.push(animation.selector);}}
function updateOrientation(){orientation=window.innerWidth<window.innerHeight?'profile':'landscape';$body.removeClass('profile landscape').addClass(orientation).trigger('turn',{orientation:orientation});}
function handleTouch(e){var $el=$(e.target);if(!$(e.target).is(touchSelectors.join(', ')))
{var $link=$(e.target).closest('a');if($link.length){$el=$link;}else{return;}}
if(event)
{var hoverTimeout=null,startX=event.changedTouches[0].clientX,startY=event.changedTouches[0].clientY,startTime=(new Date).getTime(),deltaX=0,deltaY=0,deltaT=0;$el.bind('touchmove',touchmove).bind('touchend',touchend);hoverTimeout=setTimeout(function(){$el.makeActive();},100);}
function touchmove(e){updateChanges();var absX=Math.abs(deltaX);var absY=Math.abs(deltaY);if(absX>absY&&(absX>35)&&deltaT<1000){$el.trigger('swipe',{direction:(deltaX<0)?'left':'right'}).unbind('touchmove touchend');}else if(absY>1){$el.removeClass('active');}
clearTimeout(hoverTimeout);}
function touchend(){updateChanges();if(deltaY===0&&deltaX===0){$el.makeActive();$el.trigger('tap');}else{$el.removeClass('active');}
$el.unbind('touchmove touchend');clearTimeout(hoverTimeout);}
function updateChanges(){var first=event.changedTouches[0]||null;deltaX=first.pageX-startX;deltaY=first.pageY-startY;deltaT=(new Date).getTime()-startTime;}}
$.fn.unselect=function(obj){if(obj){obj.removeClass('active');}else{$('.active').removeClass('active');}}
$.fn.makeActive=function(){return $(this).addClass('active');}
$.fn.swipe=function(fn){if($.isFunction(fn))
{return $(this).bind('swipe',fn);}else{return $(this).trigger('swipe');}}
$.fn.tap=function(fn){if($.isFunction(fn))
{var tapEvent=(jQTSettings.useFastTouch&&$.support.touch)?'tap':'click';return $(this).live(tapEvent,fn);}else{return $(this).trigger('tap');}}
publicObj={getOrientation:getOrientation,goBack:goBack,goTo:goTo,addAnimation:addAnimation,submitForm:submitForm}
return publicObj;}
$.jQTouch.prototype.extensions=[];$.jQTouch.addExtension=function(extension){$.jQTouch.prototype.extensions.push(extension);}})(jQuery);;String.prototype.trunc=function(n){return this.substr(0,n-1)+(this.length>n?' <a href="#" id="sinopse_completa">...Mais</a>':'');};var rfmg={url:"http://refilmagem.com.br",request:function(url,callback){query='select * from json where url="'+url+'"';var encodedQuery=encodeURIComponent(query.toLowerCase()),_url='http://query.yahooapis.com/v1/public/yql?q='+encodedQuery+'&format=json&callback=?';$.getJSON(_url,callback);},nome_cidade_coords:function(lat,lon,callback){var _this=this;query="select locality1 from geo.places where woeid in (select place.woeid from flickr.places where lat='"+lat+"' and lon='"+lon+"')";var encodedQuery=encodeURIComponent(query.toLowerCase()),_url='http://query.yahooapis.com/v1/public/yql?q='+encodedQuery+'&format=json&callback=?';latlon=lat+','+lon;$.getJSON(_url,function(data){cidade=data.query.results.place.locality1.content;callback.call(_this,cidade);});},service_request:function(data,callback){url=rfmg.url+"/services/json/";$.ajax({type:'GET',dataType:'jsonp',url:url,data:data,success:callback});},cidade_meta:function(cidade,callback){var _this=this;params={method:"views.get",view_name:"lista_cidades",display_id:"page_3",args:[cidade],}
rfmg.service_request(params,function(result){metadata=result.data[0];callback.call(_this,metadata);});},cidades:function(callback){var _this=this;params={method:"views.get",view_name:"lista_cidades",display_id:'page_1'}
rfmg.service_request(params,function(result){cidades=result.data;callback.call(_this,cidades);});},cinemas:function(cidade,callback){var _this=this;params={method:"views.get",view_name:"cinemas",display_id:'default',args:[cidade]}
rfmg.service_request(params,function(result){cinemas=result.data;var _cinemas=new Array();var cinema_anterior='';$.each(cinemas,function(i,item){if(cinema_anterior==item.node_node_data_field_ref_cinema_nid){return true;};telefone=item.node_node_data_field_ref_cinema_node_data_field_telefone_field_telefone_value;site=item.node_node_data_field_ref_cinema_node_data_field_url_field_url_value;var cinema={nid:item.node_node_data_field_ref_cinema_nid,nome:item.node_node_data_field_ref_cinema_title,endereco:item.node_node_data_field_ref_cinema__node_revisions_body,telefone:telefone,site:site,};_cinemas.push(cinema);cinema_anterior=cinema.nid;});callback.call(_this,_cinemas);});},get_node:function(nid,callback){var _this=this;params={method:"node.get",nid:nid}
rfmg.service_request(params,function(result){node=result.data;callback.call(_this,node);});},filme:function(nid,callback){var _this=this;params={method:"views.get",view_name:"filme",display_id:'default',args:[nid]}
rfmg.service_request(params,function(result){filmes=result.data;callback.call(_this,filmes);});},filmes_em_cartaz:function(callback){var _this=this;params={method:"views.get",view_name:"frontpage",display_id:'block_1',args:[cidade]}
rfmg.service_request(params,function(result){filmes=result.data;callback.call(_this,filmes);});},estreias_da_semana:function(cidade,callback){var _this=this;params={method:"views.get",view_name:"frontpage",display_id:'default',args:[cidade,cidade]}
rfmg.service_request(params,function(result){filmes=result.data;callback.call(_this,filmes);});},filmes_em_cartaz:function(cidade,callback){var _this=this;params={method:"views.get",view_name:"frontpage",display_id:'block_1',args:[cidade]}
rfmg.service_request(params,function(result){filmes=result.data;callback.call(_this,filmes);});},horarios_filme:function(movie_id_name,cidade,callback){var _this=this;params={method:"views.get",view_name:"horarios_filme",display_id:'default',args:[movie_id_name,cidade]}
var cinema=new Object();var horarios=new Array();var cinema_id_anterior='';rfmg.service_request(params,function(result){$.each(result.data,function(index,val){cinema_id=val.node_node_data_field_ref_cinema_nid;cinema_nome=val.node_node_data_field_ref_cinema_title;horario=val.node_data_field_horario_field_horario_value;endereco=val.node_node_data_field_ref_cinema__node_revisions_body;telefone=val.node_node_data_field_ref_cinema_node_data_field_telefone_field_telefone_value;site=val.node_node_data_field_ref_cinema_node_data_field_url_field_url_value;if(cinema_id_anterior==cinema_id){cinema.horario.push(horario);}else{cinema=new Object();cinema.id=cinema_id;cinema.nome=cinema_nome;cinema.endereco=endereco,cinema.site=site,cinema.telefone=telefone,cinema.horario=new Array(horario);horarios.push(cinema);}
cinema_id_anterior=cinema_id;});callback.call(_this,horarios);});},filme_cinemas:function(filme,cidade,horario,callback){var _this=this;params={method:"views.get",view_name:"filme_cinemas",display_id:'default',args:[filme,cidade,horario]}
rfmg.service_request(params,function(result){cinemas=result.data;callback.call(_this,cinemas);});},filmes_cinema:function(cinema,cidade,callback){var _this=this;params={method:"views.get",view_name:"filmes_cinema",display_id:'default',args:[cinema,cidade]}
rfmg.service_request(params,function(result){filmes=result.data;callback.call(_this,filmes);});},proximas_sessoes:function(cidade,callback){var _this=this;url=rfmg.url+"/api/proximas-sessoes/"+cidade+"&callback=?";$.getJSON(url,function(result){sessoes=result.nodes;callback.call(_this,sessoes);});},proximas_sessoes_near_by:function(cinemas,callback){var _this=this;url=rfmg.url+"/api/proximas-sessoes-cinemas/"+cinemas+"&callback=?";$.getJSON(url,function(result){sessoes=result.nodes;callback.call(_this,sessoes);});},distancia:function(endereco_inicio,endereco_fim,callback){var _this=this;endereco_fim=$('<div/>').html(endereco_fim).text();var google_maps_url="http://maps.google.com/maps/nav?key=ABQIAAAAm_U5X3msZlIawwmBL471ORQT_8O4OvQyFtE47Y-QdJmYm5WEQRQNZtdpTT-nM5SMKeCF5Hxx0pf0KQ&output=json&sensor=false&oe=iso-8859-1&q=";var google_maps=google_maps_url;google_maps+="from:"+escape(endereco_inicio+' ');google_maps+="to:"+escape(endereco_fim);google_maps+="&callback=?";$.getJSON(google_maps,function(data){if(data.Status.code!=200){endereco_errado=$('<div/>').html(endereco_fim).text();url_='http://maps.google.com/maps/geo?key=ABQIAAAAm_U5X3msZlIawwmBL471ORQT_8O4OvQyFtE47Y-QdJmYm5WEQRQNZtdpTT-nM5SMKeCF5Hxx0pf0KQ&q='+endereco_errado+'&oe=iso-8859-1&sensor=false&output=json&callback=?';$.getJSON(url_,function(result){if(result.Status.code==200){endereco_correto=result.Placemark[0].address;gm_url=google_maps_url;gm_url+="from:"+escape(endereco_inicio+' ');gm_url+="to:"+escape(endereco_correto);gm_url+="&callback=?";$.getJSON(gm_url,function(datax){callback.call(_this,datax);});}else{callback.call(_this,data);}});}else{callback.call(_this,data);}});},ordena_por_proximidade:function(cinemas,campo_endereco,onde_estou,callback){var _this=this;if(view.minha_cidade().latlon==null){callback.call(_this,cinemas);return;};var z=0;$.each(cinemas,function(key,cinema){endereco=eval('cinema.'+campo_endereco);rfmg.distancia(onde_estou,endereco,function(distancia){if(distancia.Status.code==200){cinema.distancia=parseInt(distancia.Directions.Distance.meters);cinema.dtempo=distancia.Directions.summaryHtml;cinema.dtempo=cinema.dtempo.replace('&nbsp;',' ');}else{cinema.distancia=parseInt(999990);}
z++;if(z==cinemas.length){cinemas.sort(function(a,b){return a.distancia-b.distancia;});callback.call(_this,cinemas);};});});},}
view={onde_estou:'',cidade:'',nome_cidade:'',set_minha_localizacao:function(latlong,_cidade,_nome_cidade){onde_estou=latlong;view.set_minha_cidade(_cidade,_nome_cidade);},set_minha_cidade:function(_cidade,_nome_cidade){cidade=_cidade;nome_cidade=_nome_cidade;},minha_cidade:function(){return{id:cidade,nome:nome_cidade,latlon:onde_estou}},grava_cache:function(name){if($('body').data(name)){return true;}
$('body').data(name,true);},limpa_cache:function(name){$('body').data(name,false);},cidades:function(){view.loaderVisible(true);if(view.grava_cache('cidades')){view.loaderVisible(false);return;}
var cidade_padrao=false;rfmg.cidades(function(cidades){var ativo='';$.each(cidades,function(index,_cidade){ativo='';cidade_padrao=false;if(_cidade.tid==cidade){cidade_padrao=true;}
anchor=$('<a/>',{id:_cidade.tid,href:'#home',text:_cidade.term_data_name});list_item=$('<li/>').attr('class','arrow').append(anchor);if(cidade_padrao){anchor.wrap('<span class="cidade_default" />');}
$('#cidades ul').append(list_item);});view.loaderVisible(false);$('#cidades ul li a').click(function(){$('#cidades ul li span.cidade_default').removeClass('cidade_default');$(this).wrap('<span class="cidade_default"/>');cidade_id=$(this).attr('id');nome=$(this).text();view.set_minha_cidade(cidade_id,nome);view.limpa_cache('cinemas');view.limpa_cache('cinema');view.limpa_cache('filmes_em_cartaz');});});},filme:function(nid){view.loaderVisible(true);$('#poster img').remove();$('#poster').addClass('loading');$('#horarios, #sinopse, #resto_sinopse, #estrelas, #detalhes p').empty();$('#titulo_original, #tempo, #classificacao, #genero, #formato, #trailer, #trailer_label').hide();rfmg.filme(nid,function(filme){filme=filme[0];nome=filme.node_title;nome=nome.replace('(dublado)','');tempo=filme.node_data_field_idade_field_tempo_value;idade=filme.node_data_field_idade_field_idade_value;trailer=filme.node_data_field_trailer_field_trailer_value;pre_estreia=filme.node_data_field_idade_field_pre_estreia_api_value;estreia=filme.node_data_field_idade_field_estreia_api_value;titulo_original=filme.node_data_field_idade_field_original_title_value;site=filme.node_data_field_url_field_url_value;movie_id_name=filme.node_data_field_idade_field_movie_id_name_value;lingua=filme.term_data_node_1_name;genero=filme.term_data_node_name;estrelas=filme.votingapi_cache_node_percent_vote_average_value;sinopse=view.strip_html(filme.node_revisions_body);sinopse_full=sinopse;sinopse=sinopse.trunc(120);poster=filme.files_node_data_field_poster_filepath;poster_url=rfmg.url+'/sites/default/files/imagecache/iphone/'+poster;$('#filme h2').text(nome);if(pre_estreia!=null){pre_estreia=pre_estreia.split(",");if($.inArray(cidade,pre_estreia)!=-1){pre_estreia=true;$('#filme h2').append('<br /><span class="detalhes_filme">(pre-estreia)</span>');};}
if(estreia!=null&&pre_estreia==false){estreia=estreia.split(",");if($.inArray(cidade,estreia)!=-1){$('#filme h2').append('<br /><span class="detalhes_filme">(estreia)</span>');};}
for(var i=0;i<5;i++){estrela=$('<div/>').css('width','0%');if(estrelas>=20){estrela.css('width','100%');}else if(estrelas>0){estrela.css('width',(100-estrelas)+'%');}
estrela=$('<div/>').addClass('estrela').append(estrela);$('#estrelas').append(estrela);estrelas=(estrelas-20);};rfmg.horarios_filme(movie_id_name,cidade,function(horarios){rfmg.ordena_por_proximidade(horarios,'endereco',onde_estou,function(data){$.each(horarios,function(index,val){anchor=$('<a/>',{id:val.id,href:'#',text:val.nome,alt:val.telefone,title:val.endereco,rel:val.site,rev:val.dtempo,});list_item=$('<li/>').attr('class','arrow').append(anchor);ul_cinema=$('<ul/>').addClass('rounded nome_cinema').append(list_item);$('<div/>').addClass('cinema').attr('id','c'+val.id).append(ul_cinema).appendTo('#horarios');div=$('div#c'+val.id).append('<ul class="horarios_cinema"/>');$.each(val.horario,function(index,horario){horafilme=new Date(new Date().toDateString()+' '+horario);hora=new Date();if(hora>=horafilme){$('<li/>').addClass('movie_started').text(horario).appendTo($('ul:last',div));}else{$('<li/>').text(horario).appendTo($('ul:last',div));}});$('<li/>').text('.').addClass('clear').appendTo($('ul:last',div));});view.loaderVisible(false);$('#horarios ul li a').click(function(){id=$(this).attr('id');nome=$(this).text();endereco=$(this).attr('title');telefone=$(this).attr('alt');site=$(this).attr('rel');distancia=$(this).attr('rev');view.filmes_cinema(id,nome,endereco,telefone,site,distancia);jqt.goTo('#cinema');return false;});});});if(tempo)$('#tempo p').html(tempo).parent().show();if(idade)$('#classificacao p').html(idade).parent().show();if(genero)$('#genero p').html(genero).parent().show();if(lingua)$('#formato p').html(lingua).parent().show();$('#sinopse').html(sinopse);$('#sinopse_completa').click(function(){$('#sinopse').html(sinopse_full);return false;});var img=new Image();$(img).load(function(){$(this).hide();$('#poster').removeClass('loading').append(this);$(this).fadeIn();}).attr('src',poster_url);video=jQuery.url.setUrl(trailer).attr("host");video_id=jQuery.url.param("v");if(video.search(/youtube/)>=0){$('#trailer_label').show();$('#trailer_label').html('<a href="#" id="trailer_link">Trailer</a>');$('#trailer_link').click(function(){$('#trailer').html('<embed src="http://www.youtube.com/v/'+video_id+'&hl=pt_BR&fs=1&" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="231" height="143"></embed>');$('#trailer').show();$('#trailer_label').text('Trailer');return false;});}else{$('#trailer, #trailer_label').hide();}});},strip_html:function(string){texto=string.replace(/<(.|\n)*?>/g,'');texto=texto.replace(/\r\n\r\n/g,"</p><p>").replace(/\n\n/g,"</p><p>");texto=texto.replace(/\r\n/g,"<br />").replace(/\n/g,"<br />");return texto;},proximas_sessoes:function(){$('#proximas-sessoes ul').empty();$('#proximas-sessoes h2#nenhuma_sessao').remove();view.loaderVisible(true);var cinemas_proximos=new Array();if(view.minha_cidade().latlon!=null){rfmg.cinemas(cidade,function(cinemas){rfmg.ordena_por_proximidade(cinemas,'endereco',onde_estou,function(data){$.each(data,function(index,val){if(index>=3)return true;cinemas_proximos.push(val.nid)});cinemas_proximos=cinemas_proximos.join(',');rfmg.proximas_sessoes_near_by(cinemas_proximos,function(horarios){if(horarios===undefined){view.loaderVisible(false);$('#proximas-sessoes').append('<h2 id="nenhuma_sessao">Nenhuma sessão por enquanto.</h2>');return;}
$.each(horarios,function(i,item){sessao=item.hora+" › "+item.filme;sessao=sessao+'<br /><span class="detalhes_filme">'+item.cinema+'</span>';class_=cidade+" "+item.hora;anchor=$('<a/>',{id:item.nid,alt:item.hora,href:'#filme',html:sessao});list_item=$('<li/>').attr('class','arrow').append(anchor);$('#proximas-sessoes ul').append(list_item);});$('#proximas-sessoes h2').text("Próximas sessões aqui perto...");view.loaderVisible(false);});});});}else{rfmg.proximas_sessoes(cidade,function(sessoes){if(sessoes===undefined){view.loaderVisible(false);$('#proximas-sessoes').append('<h2 id="nenhuma_sessao">Nenhuma sessão por enquanto.</h2>');return;}
$.each(sessoes,function(i,item){sessao=item.hora+" › "+item.title;class_=cidade+" "+item.hora;anchor=$('<a/>',{id:item.nid,alt:item.hora,href:'#filme',text:sessao});list_item=$('<li/>').attr('class','arrow').append(anchor);$('#proximas-sessoes ul').append(list_item);view.loaderVisible(false);});});}},filmes_cinema:function(cinema,nome,endereco,telefone,site,distancia){view.loaderVisible(true);$('#cinema ul, #cinema h2, #cinema #endereco_cinema').empty();$('#endereco_cinema').hide();if(telefone!='null'&&telefone!=''){endereco=endereco+'<span class="telefone">'+telefone+'</span>';};if(site!='null'&&site!=''){endereco=endereco+'<span class="site"><a href="'+site+'">Site oficial</a></span>';};$('#cinema h2').text(nome);endereco=endereco.split(',');if(endereco[3]===undefined){endereco[3]='';}else{endereco[3]=', '+endereco[3]}
endereco=endereco[0]+', '+endereco[1]+'<br />'+endereco[2]+endereco[3];if(distancia!='null'&&distancia!=''){endereco=endereco+'<span class="distancia">Distância: '+distancia+'</span>';};$('#cinema #endereco_cinema').html(endereco);$('#endereco_cinema_label').show();rfmg.filmes_cinema(cinema,cidade,function(filmes){var detalhes_filme=new Array();$.each(filmes,function(index,filme){nid=filme.node_node_data_field_ref_filme_nid;nome=filme.node_node_data_field_ref_filme_title;nome=nome.replace('(dublado)','');estreia=filme.node_node_data_field_ref_filme_node_data_field_estreia_api_field_estreia_api_value;pre_estreia=filme.node_node_data_field_ref_filme_node_data_field_estreia_api_field_pre_estreia_api_value;poster=filme.files_node_data_field_poster_filepath;lingua=filme.node_node_data_field_ref_filme__term_data_name;detalhes_filme=new Array()
if(lingua=='Dublado'){detalhes_filme.push('(dublado)');}
if(pre_estreia!=null){pre_estreias=pre_estreia.split(",");if($.inArray(cidade,pre_estreias)!=-1){detalhes_filme.push('(pre-estreia)');pre_estreia=true;};}
if(estreia!=null&&pre_estreia==false){estreias=estreia.split(",");if($.inArray(cidade,estreias)!=-1){detalhes_filme.push('(estreia)');};}
if(detalhes_filme.length>0){detalhes_filme=detalhes_filme.join(' ');detalhes_filme='<br /><span class="detalhes_filme">'+detalhes_filme+'</span>';}else{detalhes_filme='';}
anchor=$('<a/>',{id:nid,href:'#filme',html:nome+detalhes_filme,});list_item=$('<li/>').attr('class','arrow').append(anchor);$('#cinema ul').append(list_item);view.loaderVisible(false);});})},filmes_em_cartaz:function(){view.loaderVisible(true);if(view.grava_cache('filmes_em_cartaz')){view.loaderVisible(false);return;}
$('#filmes-em-cartaz ul').empty();$('#filmes-em-cartaz h2').hide();var items_estreias=[];rfmg.estreias_da_semana(cidade,function(estreias){if(estreias.length==0){$('#estreias_label, #lista_estreias').hide();}else{$('#estreias_label, #lista_estreias').show();$.each(estreias,function(index,estreia){detalhes_filme=new Array();pre_estreia=estreia.node_node_data_field_ref_filme_node_data_field_poster_field_pre_estreia_api_value;if(pre_estreia!=null){pre_estreia=pre_estreia.split(",");if($.inArray(cidade,pre_estreia)!=-1){detalhes_filme.push('(pre-estreia)');};};nome=estreia.node_node_data_field_ref_filme_title;nome=nome.replace('(dublado)','');if(estreia.node_node_data_field_ref_filme_title!=nome){detalhes_filme.push('(dublado)');};if(detalhes_filme.length>0){detalhes_filme=detalhes_filme.join(' ');detalhes_filme='<br /><span class="detalhes_filme">'+detalhes_filme+'</span>';}else{detalhes_filme='';}
anchor=$('<a/>',{id:estreia.node_node_data_field_ref_filme_nid,href:'#filme',html:nome+detalhes_filme,});list_item=$('<li/>').attr('class','arrow').append(anchor);items_estreias.push(list_item);});$.fn.append.apply($('#lista_estreias'),items_estreias);}});var items=[];rfmg.filmes_em_cartaz(cidade,function(filmes){$.each(filmes,function(index,filme){nome=filme.node_node_data_field_ref_filme_title;nome=nome.replace('(dublado)','');dublado='';if(filme.node_node_data_field_ref_filme_title!=nome){dublado='<br /><span class="detalhes_filme">(dublado)</span>';};anchor=$('<a/>',{id:filme.node_node_data_field_ref_filme_nid,href:'#filme',html:nome+dublado,});list_item=$('<li/>').attr('class','arrow').append(anchor);items.push(list_item);});$('#filmes-em-cartaz h2:last').show();$.fn.append.apply($('#lista_filmes_em_cartaz'),items);view.loaderVisible(false);});},cinemas:function(){view.loaderVisible(true);if(view.grava_cache('cinemas')){view.loaderVisible(false);return;}
$('#cinemas ul').empty();var items=[];rfmg.cinemas(cidade,function(cinemas){rfmg.ordena_por_proximidade(cinemas,'endereco',onde_estou,function(data){$.each(data,function(index,cinema){anchor=$('<a/>',{id:cinema.nid,href:'#',text:cinema.nome,title:cinema.endereco,alt:cinema.telefone,rel:cinema.site,rev:cinema.dtempo,});list_item=$('<li/>').attr('class','arrow').append(anchor);items.push(list_item);});$.fn.append.apply($('#cinemas ul'),items);view.loaderVisible(false);$('#cinemas ul li a').click(function(){id=$(this).attr('id');nome=$(this).text();endereco=$(this).attr('title');telefone=$(this).attr('alt');site=$(this).attr('rel');distancia=$(this).attr('rev');view.filmes_cinema(id,nome,endereco,telefone,site,distancia);jqt.goTo('#cinema');return false;});});});},loaderVisible:function(visible){if(visible){$('#loader').css({'display':'block'});}else{$('#loader').css('display','none');}},init:function(latlong,cidade){rfmg.cidade_meta(cidade,function(metadata){if(metadata===undefined){cidade_id='231';cidade='São Paulo';}else{cidade_id=metadata.tid;}
$('#home ul').show();$('#home h2').text(cidade);view.loaderVisible(false);view.set_minha_localizacao(latlong,cidade_id,cidade);$('#home ul li a').click(function(e){id=$(this).attr('href');switch(id){case'#cidades':view.cidades();break;case'#cinemas':view.cinemas();break;case'#proximas-sessoes':view.proximas_sessoes();break;}});});},}
var jqt=new $.jQTouch({useFastTouch:false,statusBar:'black-translucent',});$(function(){if(navigator.onLine==true){$('#home ul').hide();view.loaderVisible(true);navigator.geolocation.getCurrentPosition(function(p){latlong=p.coords.latitude+','+p.coords.longitude;rfmg.nome_cidade_coords(p.coords.latitude,p.coords.longitude,function(cidade){view.init(latlong,cidade);});},function(){cidade='São Paulo';view.init(null,cidade);});$('#proximas-sessoes ul, #filmes-em-cartaz ul, #cinema ul, #cinemas ul').click(function(){view.loaderVisible(true);});$('#filme').bind('pageAnimationEnd',function(e,info){if(info.direction=='out')return;ref=$(this).data('referrer');nid=ref.attr('id');view.filme(nid);});$('#filmes-em-cartaz').bind('pageAnimationEnd',function(e,info){if(info.direction=='out')return;view.filmes_em_cartaz();});$('#home').bind('pageAnimationEnd',function(e,info){if(info.direction=='out')return;$('h2',$(this)).text(view.minha_cidade().nome);});$('#endereco_cinema_label').click(function(){$('#endereco_cinema').show();$(this).hide();return false;});}else{$('#home h2').addClass('no-internet').html('Sem internet não funciona! :(');$('#home ul').hide();}});