export const timeSince = function(date: any) {
    if (typeof date !== 'object') {
        date = new Date(date);
    }

    var seconds = Math.floor((new Date().valueOf() - date) / 1000);
    var intervalType;

    var interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        intervalType = 'y';
    } else {
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            intervalType = 'mo';
        } else {
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
                intervalType = 'd';
            } else {
                interval = Math.floor(seconds / 3600);
                if (interval >= 1) {
                    intervalType = "h";
                } else {
                    interval = Math.floor(seconds / 60);
                    if (interval >= 1) {
                        intervalType = "min";
                    } else {
                        interval = seconds;
                        intervalType = "s";
                    }
                }
            }
        }
    }

    // if (interval > 1 || interval === 0) {
    //     intervalType += 's';
    // }

    return interval + ' ' + intervalType + ' ago';
};


const timeDescriptionMap = {
   "years":"y",
   "year":"y",
   "months":"mo",
   "month":"mo",
   "days":"d",
   "day":"d",
   "hours":"h",
   "hour":"h",
   "minutes":"min",
   "minute":"min",
   "seconds":"s",
   "second":"s",
    "just now": "1 s"
};
export function replaceTimeStr(str: string): any {
    return str.replace(/years|year|months|month|days|day|hours|hour|minutes|minute|seconds|second/gi, function(matched: string){
        // TODO: deal with this later
        //@ts-ignore
        return timeDescriptionMap[matched] || "";
    });
}
