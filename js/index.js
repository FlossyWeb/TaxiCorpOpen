
// getLocation & secureCall & Actived check
var lat = 0;
var lng = 0;
var idcourseUrg = $.sessionStorage.setItem('idcourseUrg', '');
var taxi = $.localStorage.getItem('taxi');
var tel = $.localStorage.getItem('tel');
var civil = $.localStorage.getItem('civil');
var nom = $.localStorage.getItem('nom');
var prenom = $.localStorage.getItem('prenom');
var dep = $.localStorage.getItem('dep');
var mngid = $.localStorage.getItem('mngid');
var actived;

function active()
{
	var posting = $.post("https://www.mytaxiserver.com/appclient/active_app.php", { tel: tel, mngid: mngid, dep: dep}, function(data) {
		var actived = data.active;
		// GET SHIT BACK !!
		$.localStorage.setItem('civil', data.civil);
		$.localStorage.setItem('nom', data.nom);
		$.localStorage.setItem('prenom', data.prenom);
		$.localStorage.setItem('taxi', data.taxi);
		$.localStorage.setItem('cpro', data.cpro);
		$.localStorage.setItem('tel', data.tel);
		$.localStorage.setItem('siret', data.siret);
		$.localStorage.setItem('email', data.email);
		$.localStorage.setItem('station', data.station);
		$.localStorage.setItem('dep', data.dep);
		$.localStorage.setItem('group', data.group);
	}, "json");
	posting.done(function( data ) {
		if($.localStorage.getItem('pass')=='true' && data.active)
		{
			//navigator.splashscreen.hide();
			$.mobile.loading( "show" );
			document.location.href='home.html';
		}
		else if (!data.active) {
			var display = '<p style="color:red;"><b>Il semblerait que votre compte ait &eacute;t&eacute; d&eacute;sactiv&eacute;</b></p><a href="mailto:commercial@taximedia.fr"style="width:32%;display:inline-block;"><img src="visuels/Contact_flat.png" width="90%"/></a>';
			$("#returns").empty().append(display);
			//navigator.notification.alert(actived +' - '+  $.localStorage.getItem('tel'));
		}
	});
}

// Urgence call => Danger zone
function showError(error)
{
	var x=document.getElementById("results");
	switch(error.code) 
	{
		case error.PERMISSION_DENIED:
		  x.innerHTML="Vous avez refus&eacute; l&rsquo;acc&egrave;s &agrave; la G&eacute;olocalisation."
		  break;
		case error.POSITION_UNAVAILABLE:
		  x.innerHTML="G&eacute;olocalisation indisponible, veuillez regarder dans l&rsquo;aide ou activer le service dans les reglages de votre appareil."
		  break;
		case error.TIMEOUT:
		  x.innerHTML="La demande de G&eacute;olocalisation a expir&eacute;(user location request timed out)."
		  break;
		case error.UNKNOWN_ERROR:
		  x.innerHTML="Erreur inconnue de G&eacute;olocalisation (unknown error occurred)."
		  break;
	}
}			  
function getLocationOnce()
{
	if (navigator.geolocation)
	{
		$.mobile.loading( "show" );
		navigator.geolocation.getCurrentPosition(secureCall, showError,{enableHighAccuracy:true, maximumAge:0});
		//var watchId = navigator.geolocation.watchPosition(get_coords, showError);
		//navigator.geolocation.getAccurateCurrentPosition(get_coords, showError, {maxWait:30000});
	}
	else {
		navigator.notification.alert("Localisation impossible.", alertDismissed, 'MonTaxi Erreur', 'OK');
	}
}
function secureCall(position)
{
	lat = position.coords.latitude;
	lng = position.coords.longitude;
	var rdvpoint = lat + ', ' + lng;
	var helpname = civil + ' ' + nom + ' ' + prenom;
	var myDate = new Date();
	var idcourseUrg = myDate.getTime();
	$.sessionStorage.setItem('idcourseUrg', idcourseUrg);
	
	$.post("https://www.mytaxiserver.com/appclient/secure_xml.php", { lat: lat, lng: lng, dep: dep, pass: 'true'}, function(xml){
																							 
		var i = 0; // We need to make any numreq unique on that one !!
		$(xml).find('marker').each(function(){
			var name = $(this).attr('name');
			var address = $(this).attr('address');
			var lat2 = $(this).attr('lat');
			var lng2 = $(this).attr('lng');
			var timestamp = $(this).attr('timestamp');
			var distance = $(this).attr('distance');
			var num_reqUrg = idcourseUrg + i;
			//var title = $(this).find('title').text(); To get nodes inside
			//$('<div id='+name+'></div>').html('<p><b>'+name+' - '+address+' - '+lat+' - '+lng+' - '+timestamp+' - '+distance+'</b></p>').appendTo('#secureResults');
			//$('#secureResults').append('<p><b>'+name+' - '+address+' - '+lat+' - '+lng+' - '+timestamp+' - '+distance+'</b></p>');
			
			$.post("https://www.mytaxiserver.com/appclient/secure.php", { taxi: name, tel: address, rdvpoint: rdvpoint, helptaxi: taxi, helpname: helpname, helptel: tel, idcourse: idcourseUrg, num_req: num_reqUrg, dep: dep, pass: 'true'}, function(data){
				//$('#secureResults').append(data);
			});
			i++;
		});
		check_answer();
		//navigator.notification.alert('Geoloc results :' + lat + ' - ' + lng);
		//$('#results').append('<p><b>'+name+' - '+address+' - '+lat+' - '+lng+' - '+timestamp+' - '+distance+'</b></p>');
		
	}, "xml");
}
function check_answer()
{
	$.mobile.pageContainer.pagecontainer("change", "#urgency", { transition: "slide"} );
	var idcourseUrg = $.sessionStorage.getItem('idcourseUrg');
	sec = setInterval( function () {
		$.post("https://www.mytaxiserver.com/appclient/status.php?idcourse=" + idcourseUrg + "&check=1" , { dep: dep}, function(data){ 
			if (data != 0)
			{
				//cancel(idcourse);
				//$('#dblinks').append($('<input id="stop" type="hidden" value="1" />'));
				//var box = navigator.notification.alert(data);
				$('#urgencyResults').empty().append(data);
			}
		});
	}, 6000);
	return false;
}
function stopSecureCall()
{
	var idcourseUrg = $.sessionStorage.getItem('idcourseUrg');
	$.post("https://www.mytaxiserver.com/appclient/secure.php", { taxi: '', tel: '', rdvpoint: '', helptaxi: taxi, helpname: '', helptel: tel, idcourse: idcourseUrg, dep: dep, pass: 'true', stopcall: 'true'}, function(data){
		$.mobile.pageContainer.pagecontainer("change", "#portal", { transition: "slide"} );
	});
	//$.sessionStorage.setItem('idcourseUrg', false);
	clearInterval(sec);
}
function footer()
{
	$.post("https://www.mytaxiserver.com/appclient/footer_app.php", { dep: dep }, function(data) {
		$("#footer_cont").empty().append(data);
	});
}
function alertDismissed()
{
	// Do Nothing...
}

// Checks App or Browser
app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1 && document.URL.indexOf("localhost") != 7;
if ( app ) {
	// Attendre que PhoneGap soit prêt	    //
	document.addEventListener("deviceready", onDeviceReady, false);

	// PhoneGap est prêt
	function onDeviceReady() {
		if((navigator.network.connection.type == Connection.NONE) || !window.jQuery){
			$("body").empty().append('<img src="no_network.png" width="'+screen.width+'" height="'+screen.height+'" onClick="window.location.reload()" />');
		}
		StatusBar.overlaysWebView(false);
		StatusBar.backgroundColorByHexString("#E7B242");
	}
}

$(document).on( 'pagecreate', function() {

	active();
	footer();

	$("#login").submit(function(event) {
		// stop form from submitting normally 
		event.preventDefault();
		// Subs some data 
		$.post("https://www.mytaxiserver.com/appclient/login_app.php", $("#login").serialize(), function(data) {
			// GET SHIT BACK !!
			$.localStorage.setItem('civil', data.civil);
			$.localStorage.setItem('nom', data.nom);
			$.localStorage.setItem('prenom', data.prenom);
			$.localStorage.setItem('taxi', data.taxi);
			$.localStorage.setItem('cpro', data.cpro);
			$.localStorage.setItem('tel', data.tel);
			$.localStorage.setItem('siret', data.siret);
			$.localStorage.setItem('station', data.station);
			$.localStorage.setItem('email', data.email);
			$.localStorage.setItem('dep', data.dep);
			$.localStorage.setItem('group', data.group);
			$.localStorage.setItem('pwd', data.pwd);
			$.localStorage.setItem('mngid', data.mngid);
			$.localStorage.setItem('pass', data.pass);
			$.sessionStorage.setItem('badid', data.badid);
			$.sessionStorage.setItem('banned', data.banned);
			//navigator.notification.alert(data.nom + ' - ' + data.prenom + ' - ' + data.taxi);
			//var display = $.localStorage.getItem('nom') + ' - ' + $.localStorage.getItem('prenom') + ' - ' + $.localStorage.getItem('taxi');
			var display = '';
			if (data.badid)
			{
				display = 'Les identifiant et mot de passe fournis ne sont pas corrects.<p style="color:red;"><b>ATTENTION ! Vous devez respecter le type des lettres qui composent votre mot de passe (majuscules ou minuscules).</b></p>';
			}
			if (data.banned)
			{
				display = data.civil + ' ' + data.nom + ' ' + data.prenom + ' Votre compte &agrave; &eacute;t&eacute; d&eacute;sactiv&eacute;.<p style="color:red;"><b>ATTENTION ! Vous devez renvoyer le contrat de service d&ucirc;ment rempli ainsi que votre RIB, afin de r&eacute;activer votre compte.</b></p>';
			}
			$("#returns").empty().append(display);
			$( "#answer" ).popup( "open", { positionTo: "window" } );
			if(data.pass)
			{ // IDENTIFIED SO GETS IN...
				$.mobile.loading( "show" );
				window.location='home.html';
				//document.location.href='home.html';
			}
		}, "json");
	});
		
});

$(document).ready(function(){

	// First thing we hide unnecessary forms
	var step = $.localStorage.getItem('regStep');
	var valtel = $.localStorage.getItem('tel');
	var valdep = $.localStorage.getItem('dep');
	if (step == '1') {
		$('#RegNameStep').fadeOut();
		$('#RegCabStep').fadeIn();
		$('#RegCbStep').fadeOut();
		$('#telcab').val(valtel);
		$('#telcb').val(valtel);
		$('#depcab').val(valdep);
		$('#depcb').val(valdep);
	}
	else if (step == '2') {
		$('#RegNameStep').fadeOut();
		$('#RegCabStep').fadeOut();
		$('#RegCbStep').fadeIn();
		$('#telcb').val(valtel);
		$('#depcb').val(valdep);
	}
	else if (step == 'DONE') {
		$('#RegNameStep').fadeOut();
		$('#RegCabStep').fadeOut();
		$('#RegCbStep').fadeOut();
		$('#done').append('<p><b>Vous &ecirc;tes d&eacute;j&agrave; enregistr&eacute;, vous pouvez vous connecter ci-dessous.</b></p>');
	}
	else {
		//$('#RegNameStep').fadeIn();
		$('#RegCabStep').fadeOut();
		$('#RegCbStep').fadeOut();
	}
	
	$.validator.addMethod(
		"regex",
		function(value, element, regexp) {
			var check = false;
			var re = new RegExp(regexp);
			return this.optional(element) || re.test(value);
		},""	  
	);
	
	$.validator.addMethod('phone', function (value) {
		return /^(01|02|03|04|05|06|07|08|09)[0-9]{8}$/.test(value);
	}, 'le N&deg; de t&eacute;l&eacute;phone et une s&eacute;rie de 10 chiffres sans espace commen&ccedil;ant par 0');
	
	$.validator.addMethod('siret', function (value) {
		return /^[0-9]{14}$/.test(value);
	}, 'Le N&deg; SIRET doit corresondre &agrave; 14 chiffres sans espace.');

	$.validator.addMethod('cbnum', function (value) {
		return /^[0-9]{16}$/.test(value);
	}, 'Le N&deg; CB doit corresondre &agrave; 16 chiffres sans espace.');
	
	$.validator.addMethod('cp', function (value) {
		return /^[0-9]{5}$/.test(value);
	}, 'Le Code Postal fait 5 chiffres sans espace.');

	$("#RegNameStep").validate({
		rules: {
		 nom: "required",
		 prenom: "required",
		 tel: {
		   required: true,
		   phone: true
		 },
		 station: {
		   required: true,
		   cp: true
		 },
		 email: {
		   required: true,
		   email: true
		 }
		 /*,
		 confirmail: {
		   required: true,
		   email: true,
		   equalTo: '#email'
		 }
		 */
		},
		messages: {
		 nom: "Le Nom est obligatoire",
		 prenom: "Le Pr&eacute;nom est obligatoire",
		 tel: {
		   required: "Le T&eacute;l&eacute;phone est obligatoire"
		 },
		 station: {
		   required: "Le Code Postal de la commune de stationnement est obligatoire"
		 },
		 email: {
		   required: "Nous avons besoin de votre email afin de vous contacter",
		   email: "Votre email doit &ecirc;tre au format nom@domaine.com"
		 }
		 /*,
		 confirmail: {
		   required: "L&rsquo;email ci dessus n&rsquo;a pas &eacute;t&eacute; confirm&eacute;",
		   email: "Votre email doit &ecirc;tre au format nom@domaine.com",
		   equalTo: "Cette adresse n&rsquo;est pas identique &agrave; la pr&eacute;c&eacute;dante."
		 }
		 */
		}
		// Put errors below fields
		,
		errorPlacement: function(error, element) {
			error.appendTo( element.parent().next('em') );
		}
		// Show errors sum up on top of form
		,
		invalidHandler: function(event, validator) {
			// 'this' refers to the form
			var errors = validator.numberOfInvalids();
			if (errors) {
				var message = errors == 1
				? 'Erreur: Un champs obligatoire est incorrect. Un message plus pr&eacute;cis figure sous celui-ci.'
				: 'Erreur: ' + errors + ' champs obligatoires sont incorrects. Un message plus pr&eacute;cis figure sous ceux-ci.';
				$("div.error span").html(message);
				$("div.error").show();
			} else {
				$("div.error").hide();
			}
		}		
		// Form submission if every thing is ok
		,
		submitHandler: function (form) {
			$('input[type=submit]#subNameStep').button('disable');
			$.mobile.loading( "show" );
			// Subs some data
			$.post("https://www.mytaxiserver.com/appclient/register_app_name.php", $("#RegNameStep").serialize(), function(data) {
				// GET SHIT BACK !!
				$.localStorage.setItem('civil', data.civil);
				$.localStorage.setItem('nom', data.nom);
				$.localStorage.setItem('prenom', data.prenom);
				$.localStorage.setItem('tel', data.tel);
				$.localStorage.setItem('station', data.station);
				$.localStorage.setItem('dep', data.dep);
				$.localStorage.setItem('email', data.email);
				$.localStorage.setItem('group', data.group);
				$.localStorage.setItem('pwd', data.pwd);
				$.sessionStorage.setItem('telexist', data.telexist);
				//navigator.notification.alert(data.taxi + ' - ' + data.siret + ' - ' + data.email + ' - ' + data.tel + ' - ' + data.subscribed + ' - ' + data.telexist + ' - ' + data.cabexist + ' - ' + data.sirexist);
			}, "json").done(function(data) {
				var display = '';
				if (data.subscribed)
				{
					$.localStorage.setItem('regStep', '1');
					$('#telcab').val(data.tel);
					$('#telcb').val(data.tel);
					$('#depcab').val(data.dep);
					$('#depcb').val(data.dep);
					$('#RegNameStep').fadeOut();
					$('#RegCabStep').fadeIn();
					display = '<p style="color:green;"><b>Merci, vous &ecirc;tes pr&ecirc;t &agrave; passer &agrave; l&rsquo;&eacute;tape suivante.</b></p>';
					$("div.error span").empty(); // If Step is OK we empty error handler to prevent previous errors to show during next steps.
				}
				else {
					display = '<p style="color:red;"><b>Vous n&rsquo;avez pas correctement rempli le formulaire d&rsquo;inscription. Nous vous prions de modifier les informations suivantes, si vous d&eacute;sirez  acc&egrave;der &agrave; ce service, d&eacute;sol&eacute;.</b></p>';
					if (data.telexist)
					{
						display += '<p style="color:red;"><b>Le num&eacute;ro de t&eacute;l&eacute;phone fourni est d&eacute;j&agrave; associ&eacute; &agrave; un compte.</b></p>';
					}
				}
				$("#returns").empty().append(display);
				$( "#answer" ).popup( "open", { positionTo: "window" } );
			}).always(function () {
				// reenable the inputs
				$('input[type=submit]#subNameStep').button('enable');
				$.mobile.loading( "hide" );
			}).fail(function (jqXHR, textStatus, errorThrown) {
				navigator.notification.alert('Erreur inconnue, le serveur ou la connexion internet sont indisponibles. ' + textStatus+', '+ errorThrown, alertDismissed, 'MonTaxi Erreur', 'OK');
			});
		} // submitHandler Ends
	});
	$("#RegCabStep").validate({
		rules: {
		 taxi: "required",
		 cpro: "required"
		},
		messages: {
		 taxi: "L&rsquo;ADS (N&deg; de Taxi) est obligatoire",
		 cpro: "Le N&deg; de Carte Professionelle est obligatoire"
		}
		// Put errors below fields
		,
		errorPlacement: function(error, element) {
			error.appendTo( element.parent().next('em') );
		}
		// Show errors sum up on top of form
		,
		invalidHandler: function(event, validator) {
			// 'this' refers to the form
			var errors = validator.numberOfInvalids();
			if (errors) {
				var message = errors == 1
				? 'Erreur: Un champs obligatoire est incorrect. Un message plus pr&eacute;cis figure sous celui-ci.'
				: 'Erreur: ' + errors + ' champs obligatoires sont incorrects. Un message plus pr&eacute;cis figure sous ceux-ci.';
				$("div.error span").html(message);
				$("div.error").show();
			} else {
				$("div.error").hide();
			}
		}		
		// Form submission if every thing is ok
		,
		submitHandler: function (form) {
			$('input[type=submit]#subCabStep').button('disable');
			$.mobile.loading( "show" );
			// Subs some data
			$.post("https://www.mytaxiserver.com/appclient/register_app_cab.php", $("#RegCabStep").serialize(), function(data) {
				// GET SHIT BACK !!
				$.localStorage.setItem('taxi', data.taxi);
				$.localStorage.setItem('cpro', data.cpro);
				//$.localStorage.setItem('tel', data.tel);
				//$.localStorage.setItem('dep', data.dep);
				$.sessionStorage.setItem('subscribed', data.subscribed);
			}, "json").done(function(data) {
				var display = '';
				if (data.subscribed)
				{
					$.localStorage.setItem('regStep', '2');
					$('#telcb').val(data.tel);
					$('#depcb').val(data.dep);
					$('#RegCabStep').fadeOut();
					$('#RegCbStep').fadeIn();
					display = '<p style="color:green;"><b>Merci, vous &ecirc;tes pr&ecirc;t &agrave; passer &agrave; l&rsquo;&eacute;tape finale.</b></p>';
					$("div.error span").empty(); // If Step is OK we empty error handler to prevent previous errors to show during next steps.
				}
				else {
					display = '<p style="color:red;"><b>Il y a un probl&egrave;me technique, d&eacute;sol&eacute;.</b></p>';
				}
				$("#returns").empty().append(display);
				$( "#answer" ).popup( "open", { positionTo: "window" } );
			}).always(function () {
				// reenable the inputs
				$('input[type=submit]#subCabStep').button('enable');
				$.mobile.loading( "hide" );
			}).fail(function (jqXHR, textStatus, errorThrown) {
				navigator.notification.alert('Erreur inconnue, le serveur ou la connexion internet sont indisponibles. ' + textStatus+', '+ errorThrown, alertDismissed, 'MonTaxi Erreur', 'OK');
			});
		} // submitHandler Ends
	});
	$("#RegCbStep").validate({
		rules: {
		 brand: "required",
		 cbnum: {
		   required: true,
		   cbnum: true
		 },
		 cbexpm: "required",
		 cbexpa: "required",
		 cbval: "required",
		 cgv: "required"
		},
		messages: {
		 cbnum: {
		   required: "Les Num&eacute;ros de CB sont obligatoires"
		 },
		 cbexpm: "Le mois d&rsquo;expiration est obligatoire",
		 cbexpa: "L&rsquo;Ann&eacute;e d&rsquo;expiration est obligatoire",
		 cbval: "Le Criptogramme Visuel est obligatoire",
		 cgv: "Vous devez acceper les CGV",
		}
		// Put errors below fields
		,
		errorPlacement: function(error, element) {
			error.appendTo( element.parent().next('em') );
		}
		// Show errors sum up on top of form
		,
		invalidHandler: function(event, validator) {
			// 'this' refers to the form
			var errors = validator.numberOfInvalids();
			if (errors) {
				var message = errors == 1
				? 'Erreur: Un champs obligatoire est incorrect. Un message plus pr&eacute;cis figure sous celui-ci.'
				: 'Erreur: ' + errors + ' champs obligatoires sont incorrects. Un message plus pr&eacute;cis figure sous ceux-ci.';
				$("div.error span").html(message);
				$("div.error").show();
			} else {
				$("div.error").hide();
			}
		}		
		// Form submission if every thing is ok
		,
		submitHandler: function (form) {
			$('input[type=submit]#subCbStep').button('disable');
			$.mobile.loading( "show" );
			// Subs some data
			$.post("https://www.mytaxiserver.com/appclient/register_app_cb.php", $("#RegCbStep").serialize(), function(data) {
				// GET SHIT BACK !!
				$.localStorage.setItem('civil', data.civil);
				$.localStorage.setItem('nom', data.nom);
				$.localStorage.setItem('prenom', data.prenom);
				$.localStorage.setItem('taxi', data.taxi);
				$.localStorage.setItem('cpro', data.cpro);
				$.localStorage.setItem('tel', data.tel);
				$.localStorage.setItem('siret', data.siret);
				$.localStorage.setItem('station', data.station);
				$.localStorage.setItem('email', data.email);
				$.localStorage.setItem('group', data.group);
				$.localStorage.setItem('pwd', data.pwd);
				$.localStorage.setItem('dep', data.dep);
				$.sessionStorage.setItem('subscribed', data.subscribed);
				$.sessionStorage.setItem('telexist', data.telexist);
				$.sessionStorage.setItem('cabexist', data.cabexist);
				$.sessionStorage.setItem('sirexist', data.sirexist);
				//navigator.notification.alert(data.taxi + ' - ' + data.siret + ' - ' + data.email + ' - ' + data.tel + ' - ' + data.subscribed + ' - ' + data.telexist + ' - ' + data.cabexist + ' - ' + data.sirexist);
			}, "json").done(function(data) {
				var display = '';
				if (data.subscribed && data.payzen)
				{
					display = '<p><b>' + data.civil + ' ' + data.nom + ' ' + data.prenom + ' Voici les informations d&rsquo;identification qui vous permettront d&rsquo;acc&egrave;der &agrave; votre compte :<br><span style="color:#09F;">Identifiant = ' + data.tel + '<br>Mot de passe = ' + data.pwd + '</span><br>Vous les recevrez dans quelques instants &agrave; cet email : <span style="color:#09F;">' + data.email + '</span>, merci.<br></b></p>';
					$.localStorage.setItem('regStep', 'DONE');
					// Automatically logs registered user in...
					var log = data.tel;
					var pwd = data.pwd;
					var dep = data.dep;
					$.post("https://www.mytaxiserver.com/appclient/login_app.php", { log: log, pass: pwd, dep: dep}, function(data) {
						// GET SHIT BACK !!
						$.localStorage.setItem('civil', data.civil);
						$.localStorage.setItem('nom', data.nom);
						$.localStorage.setItem('prenom', data.prenom);
						$.localStorage.setItem('taxi', data.taxi);
						$.localStorage.setItem('cpro', data.cpro);
						$.localStorage.setItem('tel', data.tel);
						$.localStorage.setItem('siret', data.siret);
						$.localStorage.setItem('station', data.station);
						$.localStorage.setItem('email', data.email);
						$.localStorage.setItem('dep', data.dep);
						$.localStorage.setItem('group', data.group);
						$.localStorage.setItem('pwd', data.pwd);
						$.localStorage.setItem('mngid', data.mngid);
						$.localStorage.setItem('pass', data.pass);
						if(data.pass)
						{ // IDENTIFIED SO GETS IN...
							setTimeout(function(){
								window.location='home.html';
							},2000);
							//document.location.href='home.html';
						}
					}, "json");
				}
				else {
					display = '<p style="color:red;"><b>Vous n&rsquo;avez pas correctement rempli le formulaire d&rsquo;inscription. Nous vous prions de modifier les informations suivantes, si vous d&eacute;sirez  acc&egrave;der &agrave; ce service, d&eacute;sol&eacute;.</b></p>';
					if (data.telexist)
					{
						display += '<p style="color:red;"><b>Le num&eacute;ro de t&eacute;l&eacute;phone fourni est d&eacute;j&agrave; associ&eacute; &agrave; un compte.</b></p>';
					}
					else if (data.sniffed == 'KO')
					{
						display += '<p style="color:red;"><b>Il y a un probl&egrave;me avec l&rsquo;enregistrement de la carte bancaire, il faut une carte VALIDE de type CB, VISA ou MASTERCARD.</b></p>';
					}
					else if (!data.signed)
					{
						display += '<p style="color:red;"><b>Il y a un probl&egrave;me technique avec l&rsquo;enregistrement de la carte bancaire.</b></p>';
					}
				}
				$("#returns").empty().append(display);
				$( "#answer" ).popup( "open", { positionTo: "window" } );
			}).always(function () {
				// reenable the inputs
				$('input[type=submit]#subCbStep').button('enable');
				$.mobile.loading( "hide" );
			}).fail(function (jqXHR, textStatus, errorThrown) {
				navigator.notification.alert('Erreur inconnue, le serveur ou la connexion internet sont indisponibles. ' + textStatus+', '+ errorThrown, alertDismissed, 'MonTaxi Erreur', 'OK');
			});
		} // submitHandler Ends
	});
	$("#forget").validate({
		rules: {
		 login: {
		   required: true,
		   phone: true
		 },
		 dep: "required",
		 mail: {
		   required: true,
		   email: true
		 }
		},
		messages: {
		 login:  {
		   required: "l&rsquo;identifiant est obligatoire.",
		   email: "l&rsquo;identifiant est un num&eacute;ro de t&eacute;l&eacute;phone sans espace."
		 },
		 dep: "Le d&eacute;partement est obligatoire",
		 mail: {
		   required: "Nous avons besoin de votre email afin de vous contacter",
		   email: "Votre email doit &ecirc;tre au format nom@domaine.com"
		 }
		}
		// Form submission if every thing is ok
		,
		submitHandler: function (form) {
			$.post("https://www.mytaxiserver.com/appclient/forget_app.php", $("#forget").serialize(), function(data) {
				//navigator.notification.alert($("#change").serialize());
				// GET SHIT BACK !!
				var display = '';
				if (data.sent)
				{
					display = '<p><b>Voici les informations d&rsquo;identification qui vous permettront d&rsquo;acc&egrave;der &agrave; votre compte :<br><span style="color:#09F;">Identifiant = ' + data.tel + '<br>Mot de passe = ' + data.pwd + '</span><br>Vous les recevrez dans quelques instants &agrave; cet email : <span style="color:#09F;">' + data.email + '</span>, merci.<br></b></p>';
				}
				else {
					display = '<p style="color:red;"><b>Nous ne pouvons divulguer vos informations personnelles car l&rsquo;identifiant ou l&rsquo;adresse mail fourni ne figure pas dans notre base de donn&eacute;e.</b></p>' + data.tel + ' - ' + data.email;
				}
				$("#returns").empty().append(display);
				$( "#answer" ).popup( "open", { positionTo: "window" } );
			}, "json").fail(function (jqXHR, textStatus, errorThrown) {
				navigator.notification.alert('Erreur inconnue, le serveur ou la connexion internet sont indisponibles. ' + textStatus, errorThrown, alertDismissed, 'MonTaxi Erreur', 'OK');
			});
		} // submitHandler Ends
		/* Put errors below fields
		,
		errorPlacement: function(error, element) {
			error.appendTo( element.parent().next('em') );
		}
		*/
	});
	/*
	$('input[name="tel"]').rules("add", { required: true, regex: "^(01|02|03|04|05|06|07|08|09)[0-9]{8}$", messages: { regex: "le N&deg; de t&eacute;l&eacute;phone doit corresondre &agrave; 10 chiffres sans espace", required: "Ce champs est obligatoire" } })
	$('input[name="siret"]').rules("add", { required: true, regex: "^[0-9]{14}$", messages: { regex: "Le N&deg; SIRET doit corresondre &agrave; 14 chiffres sans espace", required: "Ce champs est obligatoire" } })
	*/
});

