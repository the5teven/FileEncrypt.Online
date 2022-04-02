
$(document).ready(function() {
    $('h1').glitch()
});
$(window).scroll(function() {}).one('scroll resize', function() {
    $('h4').glitch()
});

function generatePassword(length,extra=true) {
    let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    if(extra){
        let generatePassword= characters + "~`!@#$%^&*()_-+={[}]|\\:;\"'<,>.?/"
    }
    let password = "";
    for (let i = 0; i < length; i++) {
        password += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return password;
}

$("#button-key-encrypt").click(function() {
    $("#key-encrypt").val(generatePassword(40));
    $("#key-encrypt").select();
    document.execCommand("copy")
    $(this).popover('show');
    setTimeout(() => {
        $(this).popover('hide');
    }, 5000);
})
$(window).on('hide.bs.modal', function() {
    $(".encrypt-bar").width("0%");
    $(".model-form").show();
    $(".loading").hide();
    $(".downloading").hide();
    $(".forms").each(function(){this.reset()})
});

function encrypt(input,pass) {
    let iv = CryptoJS.lib.WordArray.random(16);
    let file = input.files[0];
    let reader = new FileReader();
    reader.onloadend = () => {
        let wordArray = CryptoJS.lib.WordArray.create(reader.result);
        count = true
        let encrypted = CryptoJS.AES.encrypt(wordArray,pass,{iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC});
        console.log(encrypted)
        count = false
        let fileEnc = new Blob([encrypted.toString() + CryptoJS.enc.Base64.stringify(iv)],{type: "text/plain;base64"});
        let url = window.URL.createObjectURL(fileEnc);
        let filename = CryptoJS.AES.encrypt(file.name,pass,{iv: iv}).toString() + ".enc"
        $("#download-encrypt").attr("href",url)
        $("#download-encrypt").attr("download",filename)
        setTimeout(()=>{ $(".loading").hide(); $(".downloading").show()},1000)
    };
    reader.readAsArrayBuffer(file);
}

function convertWordArrayToUint8Array(wordArray) {
    let arrayOfWords = wordArray.hasOwnProperty("words") ? wordArray.words : [];
    let length = wordArray.hasOwnProperty("sigBytes") ? wordArray.sigBytes : arrayOfWords.length * 4;
    let uInt8Array = new Uint8Array(length), index=0, word, i;
    for (i=0; i<length; i++) {
        word = arrayOfWords[i];
        uInt8Array[index++] = word >> 24;
        uInt8Array[index++] = (word >> 16) & 0xff;
        uInt8Array[index++] = (word >> 8) & 0xff;
        uInt8Array[index++] = word & 0xff;
    }
    return uInt8Array;
}

function decrypt(input,pass) {
    let file = input.files[0];
    let reader = new FileReader();
    reader.onload = () => {
        let result = reader.result
        let iv = CryptoJS.enc.Base64.parse(result.slice(-24));
        pass = CryptoJS.enc.Base64.parse(result.slice(-24));
        let text = result.slice(0,result.length-24);
        count = true
        let decrypted = CryptoJS.AES.decrypt(text, pass,{ iv: iv, padding: CryptoJS.pad.Pkcs7,mode: CryptoJS.mode.CBC});
        count = false
        let typedArray = convertWordArrayToUint8Array(decrypted);
        let filetype = {};
        let fileDec = new File([new Blob([typedArray],filetype)],file.name);
        let url = window.URL.createObjectURL(fileDec);


        let filename = file.name.split('.').slice(0, -1)
        try {filename = CryptoJS.AES.decrypt(name,pass,{iv: iv}).toString(CryptoJS.enc.Utf8)}catch{filename = filename + ".denc" }
        console.log(name)


        $("#download-decrypt").attr("href",url)
        $("#download-decrypt").attr("download",filename)
        setTimeout(()=>{ $(".loading").hide(); $(".downloading").show()},1000)
    };
    reader.readAsText(file);
}


$( "#encrypt-form" ).submit(function( e ) {
    e.preventDefault();
    let filesize = (($('#formFile-key-encrypt').get(0).files[0].size/1024)/1024).toFixed(4)
    if(filesize > 200){
        $('#formFile-key-encrypt')[0].setCustomValidity("File must be less then 200mb");
    }else {
        $(".model-form").hide()
        $(".loading").show()
        let pass = $("#key-encrypt").val();
        encrypt($("#formFile-key-encrypt").get(0),pass);
    }
    $('#formFile-key-encrypt')[0].reportValidity();
    $('#formFile-key-encrypt')[0].setCustomValidity("");

})

$( "#decrypt-form" ).submit(function( e ) {
    e.preventDefault();
    let filesize = (($('#formFile-key-decrypt').get(0).files[0].size/1024)/1024).toFixed(4)
    if(filesize > 200){
        $('#formFile-key-decrypt')[0].setCustomValidity("File must be less then 200mb");
    }
    else {
        $(".model-form").hide()
        $(".loading").show()
        let pass = $("#key-decrypt").val();
        decrypt($("#formFile-key-decrypt").get(0),pass);
    }
    $('#formFile-key-decrypt')[0].reportValidity();
    $('#formFile-key-decrypt')[0].setCustomValidity("");

})

$(".reload").click(()=>{
    $(".encrypt-bar").width("0%");
    $(".model-form").show();
    $(".loading").hide();
    $(".downloading").hide();
    $(".forms").each(function(){this.reset()})
})