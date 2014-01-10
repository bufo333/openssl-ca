// This is the main program file contents bellow

// Third party Libraries and requirements.

var fs = require('fs');
var tmp = require('tmp');
var path = require('path');
var spawn = require('child_process').exec;

// variable declarations

var userReq = new Object();

var caDefault,
    policy,
    policyMatch,
    req,
    reqDistinguishedName,
    reqAttributes,
    usrCert,
    v3Req,
    v3Ca,
    crlExt,
    proxyCertExt,
    file;


// App Setup

function configureApp() {
    fs.exists('config.json',function(exists) {
        if (exists) {
            fs.readFile('config.json','utf8', function(err,data) {
                if (err) {
                    console.log("error");
                    throw err;
                    
                    }
                else {
                    file = JSON.parse(data);
                    caDefault = file[0];
                    policy= file[1];
                    policyMatch = file[2];
                    req = file[3];
                    reqDistinguishedName = file[4];
                    reqAttributes = file[5];
                    usrCert = file[6];
                    v3Req = file[7];
                    v3Ca = file[8];
                    crlExt = file[9];
                    proxyCertExt = file[10];
                    createCertFile();
                    //console.log("file contents: " + data);
                    }
            })
        }
        else {
            console.log("File does not exist");
            // Configure application Defaults
            caDefault = {
                name: "[ CA default ]",
                dir: "509CA",
                certs: "/certs",
                crl_dir: "/crl",
                database: "/index.txt",
                new_certs_dir: "/newcerts",
                certificate: "/ca/new_ca.pem",
                serial: "serial",
                crl: "crl.pem",
                private_key: "new_ca_pk.pem",
                RANDFILE: ".rand",
                x509_extensions: "usr_cert",
                name_opt: "ca_default",
                cert_opt: "ca_default",
                default_days: "365",
                default_crl_days: "30",
                default_md: "sha1",
                preserve: "no"
            }

            policy = "policy_match";

            policyMatch = {
                name: "[ policy_match ] ",
                countryName: "match",
                stateOrProvinceName: "match",
                organizationName: "match",
                organizationalUnitName: "optional",
                commonName: "supplied",
                emailAddress: "optional"
            }

            req = {
                name: "[ req ]",
                default_bits: "2048",
                default_keyfile: "privkey.pem",
                distinguished_name: "req_distinguished_name",
                attributes: "req_attributes",
                x509_extensions: "v3_ca",
                string_mask: "nombstr"
            }

            reqDistinguishedName = {
                name: "[ req_distinguished_name ]",
                countryName: "Country Name (2 letter code)",
                countryName_default: "US",
                countryName_min: "2",
                countryName_max: "2",
                stateOrProvinceName: "State or Province Name (full name)",
                stateOrProvinceName_default: "FL",
                localityName: "Locality Name (eg, city)",
                "organizationName": "Organization Name (eg, company)",
                "organizationName_default": "Organization Name Here",
                organizationalUnitName : "Organizational Unit Name (eg, section)",
                commonName: "Common Name (e.g. server FQDN or YOUR name)",
                commonName_max: "64",
                emailAddress: "Email Address",
                emailAddress_max: "64"
            }

            reqAttributes = {
                name: "[ req_attributes ]",
                challengePassword: "A challenge password",
                challengePassword_min: "4",
                challengePassword_max: "20",
                unstructuredName: "An optional company name"
            }

            usrCert = {
                name: "[ usr_cert ]",
                basicConstraints: "CA:FALSE",
                nsComment: '"OpenSSL Generated Certificate"',
                subjectKeyIdentifier: "hash",
                authorityKeyIdentifier: "keyid,issuer"
            }
    
            v3Req = {
                name: "[ v3_req ]",
                basicConstraints: "CA:FALSE",
                keyUsage: "nonRepudiation, digitalSignature, keyEncipherment"
            }   

            v3Ca = {
                name: "[ v3_ca ]",
                subjectKeyIdentifier: "hash",
                authorityKeyIdentifier: "keyid:always,issuer:always",
                basicConstraints : "CA:true"
            }

            crlExt = {
                name: "[ crl_ext ]",
                authorityKeyIdentifier: "always,issuer:always"
            }

            proxyCertExt = {
                name: "[ proxy_cert_ext ]",
                basicConstraints: "CA:FALSE",
                nsComment: '"OpenSSL Generated Certificate"',
                subjectKeyIdentifier: "hash",
                authorityKeyIdentifier: "keyid,issuer:always",
                proxyCertInfo: "critical,language:id-ppl-anyLanguage,pathlen:3,policy:foo"
            }
            writeConfigFile();
        }
    })
}




function writeConfigFile() {
    var file = new Array(
        caDefault,
        policy,
        policyMatch,
        req,
        reqDistinguishedName,
        reqAttributes,
        usrCert,
        v3Req,
        v3Ca,
        crlExt,
        proxyCertExt
    ); 
    fs.writeFile('config.json',JSON.stringify(file),function(err) {
        if (!err) {
            console.log("Wrote config!");
            }
        else {
            throw err;
            }
        })

}

function createCertFile() {

    var certCFG=[];
    certCFG.push("RANDFILE\t\t= $ENV::HOME/.rnd");
    certCFG.push("\n\n\n");
    certCFG.push(req.name+"\n");
    certCFG.push(Object.keys(req)[1]+ "\t\t= " + req.default_bits+"\n");
    certCFG.push(Object.keys(req)[2]+ "\t\t= " + req.default_keyfile+"\n");
    certCFG.push(Object.keys(req)[3]+ "\t\t= " + req.distinguished_name+"\n");
    certCFG.push(Object.keys(req)[4]+ "\t\t= " + req.attributes+"\n");
    certCFG.push("prompt\t\t= no"+"\n");
    certCFG.push("output_password\t\t= 12345"+"\n");
    certCFG.push("\n"+"\n"+"\n"+"\n");
    certCFG.push(reqDistinguishedName.name+"\n");
    certCFG.push(Object.keys(reqDistinguishedName)[1]+ "\t\t= " + reqDistinguishedName.countryName+"\n");
    certCFG.push(Object.keys(reqDistinguishedName)[5]+ "\t\t= " + reqDistinguishedName.stateOrProvinceName+"\n");
    certCFG.push(Object.keys(reqDistinguishedName)[7]+ "\t\t= " + reqDistinguishedName.localityName+"\n");
    certCFG.push(Object.keys(reqDistinguishedName)[8]+ "\t\t= " + "O." + reqDistinguishedName.organizationName+"\n");
    certCFG.push(Object.keys(reqDistinguishedName)[10]+ "\t\t= " + reqDistinguishedName.organizationalUnitName+"\n");
    certCFG.push(Object.keys(reqDistinguishedName)[11]+ "\t\t= " + reqDistinguishedName.commonName+"\n");
    certCFG.push(Object.keys(reqDistinguishedName)[13]+ "\t\t= " + reqDistinguishedName.emailAddress+"\n");




    for (var i = 0;i<Object.keys(certCFG).length;i++){
        console.log(certCFG[i]);
}
    var filename = fs.createWriteStream('tmp.cnf', {'flags':'a'});
    for (var i = 0;i<certCFG.length;i++){
        filename.write(certCFG[i]);
    }
}


function createCSR(){
    var privkey = createPrivKey();
    createCertFile();
}

function createPrivKey() {
    var ps = spawn('/usr/bin/openssl genrsa 2048');
    ps.stdout.on('data', function(buffer) {
        console.log(buffer);
        return(buffer);
        })
                 
}


function signCert(){

}




//createPrivKey();
configureApp();

