$(document).ready(function() {
    $('#advanced-show').click(function() {
        $("#advanced-content").slideToggle(200);

        var $icon = $("#advanced-expando-icon");
        if ($icon.hasClass("ui-icon-plus"))
            $icon.removeClass("ui-icon-plus").addClass("ui-icon-minus");
        else
            $icon.removeClass("ui-icon-minus").addClass("ui-icon-plus");

        return false;
    });

    disableOnCheck("#checkbox-other", "#value-other");
    disableOnCheck("#checkbox-food", "#value-food");
    disableOnCheck("#checkbox-gas", "#value-gas");
    disableOnCheck("#checkbox-hotel", "#value-hotel");
});
    
function disableOnCheck(checkbox, input) {

    $(checkbox).live('change', function (evt) {
        if ($(evt.currentTarget).attr("checked"))
            $(input).removeAttr("disabled");
        else {
            $(input).attr("disabled", "disabled");
        }
    });

}
    
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}
