$(document).ready(function () {
    $('.accordion .head').click(function () {
        $(this).next().toggle('slow');
        return false;
    }).next().hide();

    $('#form-submit').click(function () {
        var url = "mapindex.html?o=" + $("#input-origin").val() + "&d=" + $("#input-destination").val();

        window.location.href = url;
    });
});