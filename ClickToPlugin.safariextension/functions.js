"use strict";
function removeHTMLNode(node) {
	while(node.parentNode.parentNode && node.parentNode.childNodes.length === 1) node = node.parentNode;
	node.parentNode.removeChild(node);
}

function disableSIFR(element) {
	var sIFRElement = element.parentNode;
	if(!sIFRElement) return;
	var regex = /\bsIFR-(?:hasFlash|active)\b/g;
	document.documentElement.className = document.documentElement.className.replace(regex, "");
	document.body.className = document.body.className.replace(regex, "");
	var sIFRAlternate = sIFRElement.getElementsByClassName("sIFR-alternate")[0];
	if(sIFRAlternate) sIFRElement.innerHTML = sIFRAlternate.innerHTML;
	sIFRElement.classList.remove("sIFR-replaced");
}

function applyCSS(element, style, properties) {
	for(var x in properties) {
		element.style.setProperty(properties[x], style.getPropertyValue(properties[x]), "important");
	}
}

function downloadURL(url) {
	// NOTE: This function should not work according to DOM Events 3
	// Another (nasty) way would be QuickTime plugin with autohref="true" and target=""
	var downloadLink = document.createElement("a");
	downloadLink.href = url;
	var event = document.createEvent("MouseEvents");
	event.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0, false, true, false, false, 0, null);
	downloadLink.dispatchEvent(event);
}

function sendToDownloadManager(url) {
	var DMObject = document.createElement("embed");
	DMObject.allowedToLoad = true;
	DMObject.className = "CTPpluginLauncher";
	DMObject.setAttribute("type", "application/zip");
	DMObject.setAttribute("width", "0");
	DMObject.setAttribute("height", "0");
	DMObject.setAttribute("src", url);
	document.body.appendChild(DMObject);
	setTimeout(function() {document.body.removeChild(DMObject);}, 5000);
}

function openInQuickTimePlayer(url) {
	// Relative URLs need to be resolved for QTP
	var anchor = document.createElement("a");
	anchor.href = url;
	url = anchor.href;
	var QTObject = document.createElement("embed");
	QTObject.allowedToLoad = true;
	QTObject.className = "CTPpluginLauncher";
	QTObject.setAttribute("type", "video/quicktime");
	QTObject.setAttribute("width", "0");
	QTObject.setAttribute("height", "0");
	// need an external URL for source, since QT plugin doesn't accept safari-extension:// protocol
	// Apple has a small 1px image for this same purpose
	QTObject.setAttribute("src", "http://images.apple.com/apple-events/includes/qtbutton.mov");
	QTObject.setAttribute("href", url);
	QTObject.setAttribute("target", "quicktimeplayer");
	QTObject.setAttribute("autohref", "true");
	document.body.appendChild(QTObject);
	setTimeout(function() {document.body.removeChild(QTObject);}, 5000);
}

// Shortcuts
function simplifyWheelDelta(x, y) {
	if(x > y && y > -x) return "left";
	if(x > y) return "down";
	if(-x > y) return "right";
	return "up";
}

function testShortcut(event, shortcut) {
	if(event.type === "mousewheel") {
		if(simplifyWheelDelta(event.wheelDeltaX, event.wheelDeltaY) !== shortcut.direction) return false;
		for(var x in shortcut) {
			if(x !== "direction" && event[x] !== shortcut[x]) return false;
		}
	} else {
		for(var x in shortcut) {
			if(event[x] !== shortcut[x]) return false;
		}
	}
	event.preventDefault();
	event.stopPropagation();
	return true;
}

// Look for usable media fallback content
function mediaFallback(element) {
	var mediaElements = element.getElementsByTagName("video");
	if(mediaElements.length === 0) {
		mediaElements = element.getElementsByTagName("audio");
		if(mediaElements.length === 0) return null;
	}
	if(mediaElements[0].src) return mediaElements[0];
	var sourceElements = mediaElements[0].getElementsByTagName("source");
	for(var i = 0; i < sourceElements.length; i++) {
		if(mediaElements[0].canPlayType(sourceElements[i].type)) return mediaElements[0];
	}
	return null;
}

function getParams(element) {
	var params = {};
	// all attributes are passed to the plugin
	// FIXME?: only no-NS attributes should be considered
	for(var i = 0; i < element.attributes.length; i++) {
		params[element.attributes[i].name.toLowerCase()] = element.attributes[i].value;
	}
	// for objects, add (and overwrite with) param children
	if(element.nodeName.toLowerCase() === "object") {
		var paramElements = element.getElementsByTagName("param");
		for(var i = 0; i < paramElements.length; i++) {
			params[paramElements[i].name.toLowerCase()] = paramElements[i].value;
		}
	}
	return params;
}
