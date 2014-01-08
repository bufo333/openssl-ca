// This is the main program file contents bellow

// Third party Libraries and requirements.

var fs = require('fs');
//var tmp = require('tmp');
var path = require('path');
  

// variable declarations

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
                    console.log("file contents: " + data);
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
                countryName: "Country Name (2 letter code)",
                countryName_default: "US",
                countryName_min: "2",
                countryName_max: "2",
                stateOrProvinceName: "State or Province Name (full name)",
                stateOrProvinceName_default: "FL",
                localityName: "Locality Name (eg, city)",
                "0.organizationName": "Organization Name (eg, company)",
                "0.organizationName_default": "Organization Name Here",
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
    }
                 )
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

configureApp();

