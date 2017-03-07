$(function(){
	$("#selector").change(function(){
		$("#frame").attr("src", $(this).val() + ".html");
	});
});