var owningTeams = function (docText) {
    var result = [];
    var transferRE = /from Owning Team \[(.*)\] to \[(.*)\]/g;
    var transfer;
    while (transfer = transferRE.exec(docText)) {
        result.pop(); // pop the last "from" team; It's the same as the new "to" team.
        result.push(transfer[2]); // push the "to" team
        result.push(transfer[1]); // push the "from" team
    }
    return result.filter(function (team) { return !!team; }); // filter out the empty strings
};
var loadActivityLog = function (callback) {
    var activityLogIframe = document.createElement('iframe');
    activityLogIframe.style.visibility = 'hidden';
    activityLogIframe.style.position = 'absolute';
    activityLogIframe.src = document.location.href.replace('home', 'activitylog');
    var activityLogInterval = window.setInterval(function () {
        var _a, _b;
        var scrollElement = (_a = activityLogIframe === null || activityLogIframe === void 0 ? void 0 : activityLogIframe.contentDocument) === null || _a === void 0 ? void 0 : _a.getElementsByClassName('infinite-scroll')[0];
        var innerText = (_b = scrollElement) === null || _b === void 0 ? void 0 : _b.innerText;
        if (!innerText) {
            return;
        }
        window.clearInterval(activityLogInterval);
        callback(innerText);
    }, 500);
    document.body.appendChild(activityLogIframe);
};
var loadActivityCallback = function (text) {
    var pwningTeams = new OwningTeamInfo(owningTeams(text));
    console.log(pwningTeams.teams.length);
    document.body.insertAdjacentHTML('beforeend', pwningTeams.html());
};
var OwningTeamInstanceInfo = /** @class */ (function () {
    function OwningTeamInstanceInfo(name) {
        this.name = name;
    }
    OwningTeamInstanceInfo.prototype.html = function () {
        return "<tr><td class=\"name\">" + this.name + "</td><td class=\"repeat\">" + (this.repeat || '') + "</td></tr>";
    };
    return OwningTeamInstanceInfo;
}());
var OwningTeamInfo = /** @class */ (function () {
    function OwningTeamInfo(teamNames) {
        this._style = "\n        <style>\n            .owningTeamTable {\n                width: 450px;\n                padding: 0;\n                spacing: 0;\n                background-color: white;\n            }\n            .owningTeamTable td.name,\n            .owningTeamTable th.name {\n                max-width: 400px;\n                overflow: hidden;\n                text-overflow: ellipsis;\n                white-space: nowrap;\n            }\n            .owningTeamTable td.name:hover {\n                overflow: visible;\n            }\n            .owningTeamTable td.repeat,\n            .owningTeamTable th.repeat {\n                width: 50px;\n            }\n        </style>";
        this.teams = teamNames.map(function (teamName) { return new OwningTeamInstanceInfo(teamName); });
        this.teamCount = 0;
        for (var i = 0; i < this.teams.length; i++) {
            var teamInstance = this.teams[i];
            if (teamInstance.repeat) {
                // we've already counted this team
                teamInstance.repeat = undefined;
                continue;
            }
            // first time seeing this team
            this.teamCount++;
            var teamAppearances = [teamInstance];
            for (var ii = i + 1; ii < this.teams.length; ii++) {
                // Count total appearances of this team
                if (teamInstance.name === this.teams[ii].name) {
                    teamAppearances.push(this.teams[ii]);
                }
            }
            for (var j = 0; j < teamAppearances.length; j++) {
                teamAppearances[j].repeat = teamAppearances.length;
            }
        }
    }
    OwningTeamInfo.prototype.html = function () {
        return "\n        " + this._style + "\n        <table class=\"owningTeamTable\">\n            <tr><th class=\"name\">Owning Teams</th><th class=\"repeat\">" + this.teamCount + "</th></tr>\n            " + this.teams.map(function (team) { return team.html(); }).join('') + "\n        </table>";
    };
    return OwningTeamInfo;
}());
loadActivityLog(loadActivityCallback);
