
const owningTeams = (docText: string): string[] => {
    const result: string[] = [];
    const transferRE = /from Owning Team \[(.*)\] to \[(.*)\]/g;
    let transfer: RegExpExecArray;
    while (transfer = transferRE.exec(docText)) {
        result.pop(); // pop the last "from" team; It's the same as the new "to" team.
        result.push(transfer[2]); // push the "to" team
        result.push(transfer[1]); // push the "from" team
    }
    return result.filter(team => !!team); // filter out the empty strings
}

const loadActivityLog = (callback: (text: string) => void) => {
    const activityLogIframe: HTMLIFrameElement = document.createElement('iframe');
    activityLogIframe.style.visibility = 'hidden';
    activityLogIframe.style.position = 'absolute';
    activityLogIframe.src = document.location.href.replace('home', 'activitylog');
    const activityLogInterval = window.setInterval(() => {
        const scrollElement = activityLogIframe?.contentDocument?.getElementsByClassName('infinite-scroll')[0];
        const innerText = (scrollElement as HTMLElement)?.innerText;
        if (!innerText) {
            return;
        }
        window.clearInterval(activityLogInterval);
        callback(innerText);
    }, 500);
    document.body.appendChild(activityLogIframe);
}

const loadActivityCallback = (text: string) => {
    const pwningTeams = new OwningTeamInfo(owningTeams(text));
    console.log(pwningTeams.teams.length);
    document.body.insertAdjacentHTML('beforeend', pwningTeams.html());
};

class OwningTeamInstanceInfo {
    name: string;
    repeat?: number;
    constructor(name: string) {
        this.name = name;
    }
    public html(): string {
        return `<tr><td class="name">${this.name}</td><td class="repeat">${this.repeat || ''}</td></tr>`;
    }
}
class OwningTeamInfo {
    teamCount: number;
    teams: OwningTeamInstanceInfo[];
    constructor(teamNames: string[]) {
        this.teams = teamNames.map(teamName => new OwningTeamInstanceInfo(teamName));
        this.teamCount = 0;
        for (let i = 0; i < this.teams.length; i++) {
            const teamInstance = this.teams[i];
            if (teamInstance.repeat) {
                // we've already counted this team
                teamInstance.repeat = undefined;
                continue;
            }
            // first time seeing this team
            this.teamCount++;
            const teamAppearances: OwningTeamInstanceInfo[] = [teamInstance];
            for (let ii = i + 1; ii < this.teams.length; ii++) {
                // Count total appearances of this team
                if (teamInstance.name === this.teams[ii].name) {
                    teamAppearances.push(this.teams[ii]);
                }
            }
            for (let j = 0; j < teamAppearances.length; j++) {
                teamAppearances[j].repeat = teamAppearances.length;
            }
        }
    }
    private _style: string = `
        <style>
            .owningTeamTable {
                width: 450px;
                padding: 0;
                spacing: 0;
                background-color: white;
            }
            .owningTeamTable td.name,
            .owningTeamTable th.name {
                max-width: 400px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .owningTeamTable td.name:hover {
                overflow: visible;
            }
            .owningTeamTable td.repeat,
            .owningTeamTable th.repeat {
                width: 50px;
            }
        </style>`;
    public html(): string {
        return `
        ${this._style}
        <table class="owningTeamTable">
            <tr><th class="name">Owning Teams</th><th class="repeat">${this.teamCount}</th></tr>
            ${this.teams.map(team => team.html()).join('')}
        </table>`;
    }
}

loadActivityLog(loadActivityCallback);