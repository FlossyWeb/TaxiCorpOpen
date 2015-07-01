function marquee(idWrapper,idMarquee,vitesse)
/*
* idWrapper : l'identifiant du div autour du span contenant le texte à faire défiler
*	idMarquee : l'identifiant du span autour du texte
*	vitesse : nombre de millisecondes entre chaque déplacement de 1px
html :

<div id='marquee-wrapper'>
	<span id='marquee'>
		Mon texte à faire défiler
	</span>
</div>

css :

#marquee-wrapper {
	position:relative;
	width:100%;
	overflow:hidden;
	height:100%;
}
#marquee {
	position:absolute;
	top:0px;
	left:0px;
	white-space : nowrap;
}

JS call :

marquee('marquee-wrapper','marquee',10);
*/
{
var oIdWrapper=$('#'+idWrapper);
var oIdMarquee=$('#'+idMarquee);

var width=oIdMarquee.width();
var width2=oIdWrapper.width();

id_inst=setTimeout(function() {marquee(idWrapper,idMarquee,vitesse)},vitesse);

var l=parseInt(oIdMarquee.css('left'));
oIdMarquee.css({left:(l-1)+'px'});

if((-parseInt(oIdMarquee.css('left')))>=(width))
{
oIdMarquee.css({left:(width2)+'px'});
}
}
