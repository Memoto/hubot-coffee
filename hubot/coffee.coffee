# Description
#   Web hook for the Stockholm coffee brewer
#
# Commands
#   there's no commands.
# Author:
#   Johan Stenehall <johan@narrativeteam.com> (https://github.com/stenehall)
#
# Contributors:
#   Joakim Berglund <joakim@getnarrative.com> (https://github.com/Berglund)

module.exports = (robot) ->
    robot.router.get "/brewingcoffee", (req, res) ->
        user = {}
        user.room = '31142_stockholm_team@conf.hipchat.com'
        user.type = 'groupchat'
        robot.send user, "Started brewing some (coffee), just for you. Ready soon."
        res.writeHead 200, {'Content-Type': 'text/plain'}
        res.end 'Over and out'

    robot.router.get "/donecoffee", (req, res) ->
        user = {}
        user.room = '31142_stockholm_team@conf.hipchat.com'
        user.type = 'groupchat'
        robot.send user, "Ah, take a break and go get a fresh cup of (coffee)."
        res.writeHead 200, {'Content-Type': 'text/plain'}
        res.end 'Over and out'
