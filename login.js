var passport = require('passport');
var oauth2 = require('./oauth2');

function getAuthId() {
    return {
        "authId": "$jwt-value",
        "template": "",
        "stage": "LDAP1",
        "callbacks": [
            {
                "type": "NameCallback",
                "output": [
                    {
                        "name": "prompt",
                        "value": " User Name: "
                    }
                ],
                "input": [
                    {
                        "name": "IDToken1",
                        "value": ""
                    }
                ]
            },
            {
                "type": "PasswordCallback",
                "output": [
                    {
                        "name": "prompt",
                        "value": " Password: "
                    }
                ],
                "input": [
                    {
                        "name": "IDToken2",
                        "value": ""
                    }
                ]
            }
        ]
    };
}

 exports.authenticate = [
     function(req, res, next) {

            if(!req.body || !req.body.authId) {
                // Post without authID returns the callback structure.
                // in OPENAM this would be an empty post.
                res.json(getAuthId());
                return;
            };


         if (req.body.authId
             && req.body.stage == "LDAP1"
             && req.body.callbacks
             && req.body.callbacks.length == 2
             && req.body.callbacks[0].input[0].value
             && req.body.callbacks[1].input[0].value) {

             // EXtract username and password from callbacks so we can log in against the oAuth server.
             req.body.username = req.body.callbacks[0].input[0].value;
             req.body.password = req.body.callbacks[1].input[0].value;

             return passport.authenticate('local', { }, function (err, user, info) {
                 if (!user) {
                     res.status(401);
                     res.json({
                         "code": 401,
                         "reason": "Unauthorized",
                         "message": "Invalid Password!!",
                         "failureUrl": "http://route53/iam/401.html"
                     });
                 }
                 else {
                     var iPlanetDirectoryProValue = `${user.username}:${user.password}`;
                     res.json({
                         "tokenId": iPlanetDirectoryProValue,
                         "successUrl": "/iam/profile"
                     });
                 }
                 next();
             })(req, res, next);
         }
     }
 ];

