$(document).ready(function () {
    $('#advanced-show').click(function () {
        $("#advanced-content").slideToggle(200);
        return false;
    });

    $("#checkbox-other").live('change', function (evt) {
        if ($(evt.currentTarget).attr("checked"))
            $("#input-other").removeAttr("disabled");
        else {
            $("#input-other").attr("disabled", "disabled");
        }
    });

    $("#input-origin, #input-destination").focus(function () {
        if ($(this).val().toLowerCase() === "origin..." || $(this).val().toLowerCase() === "destination...") {
            $(this).val("");
        }
    }).blur(function () {
        if ($(this).val().trim().toLowerCase() === "") {
            if ($(this).attr("id") == "input-origin")
                $(this).val("Origin...");
            else
                $(this).val("Destination...");
        }
    });

    $('#form-submit').click(function () {
        var food = ($("#checkbox-food").attr("checked") == "checked") ? $("#value-food").val() : 0;
        var gas = ($("#checkbox-gas").attr("checked") == "checked") ? $("#value-gas").val() : 0;
        var hotel = ($("#checkbox-hotel").attr("checked") == "checked") ? $("#value-hotel").val() : 0;
        var other = ($("#checkbox-other").attr("checked") == "checked") ? $("#value-other").val() : "";

        var url = "mapindex.html?" +
                    "o=" + $("#input-origin").val() +
                    "&d=" + $("#input-destination").val() +
                    "&food=" + food +
                    "&gas=" + gas +
                    "&hotel=" + hotel +
                    "&other=" + other;

        window.location.href = url;
    });
});
