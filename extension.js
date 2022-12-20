export default {
    onload: () => {
        window.roamAlphaAPI.ui.commandPalette.addCommand({
            label: "Import today's comic from The Far Side",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before importing The Far Side");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                fetchFS().then(async (blocks) => {
                    await window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: blocks[0].text.toString(), open: true } });
                    for (var i = 0; i < blocks[0].children.length; i++) {
                        var thisBlock = window.roamAlphaAPI.util.generateUID();
                        await window.roamAlphaAPI.createBlock({
                            location: { "parent-uid": uid, order: i + 1 },
                            block: { string: blocks[0].children[i].text.toString(), uid: thisBlock }
                        });
                    }
                });
            },
        });

        const args = {
            text: "FARSIDE",
            help: "Import today's comic from The Far Side",
            handler: (context) => fetchFS,
        };

        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.registerCommand(args);
        } else {
            document.body.addEventListener(
                `roamjs:smartblocks:loaded`,
                () =>
                    window.roamjs?.extension.smartblocks &&
                    window.roamjs.extension.smartblocks.registerCommand(args)
            );
        }

        var requestOptions = {
            method: 'GET',
            timeout: 0,
            redirect: 'follow'
        };

        async function fetchFS() {
            var url = "https://dyn.tedder.me/rss/farside/daily.json";
            const response = await fetch(url, requestOptions);
            const data = await response.text();
            var responses = await JSON.parse(data);
            var description = responses.items[0].content_html.toString();
            var string = "![](" + responses.items[0].image.toString() + ")";
            const regex = /(.+<br \/>)/;
            const regex1 = /(\r?\n)/gm;
            var description1 = description.replace(regex, "");
            description = description1.replaceAll(regex1, " ");

            return [{
                text: "" + string + "",
                children: [
                    { text: "" + description + "" },
                ]
            },];
        };
    },
    onunload: () => {
        window.roamAlphaAPI.ui.commandPalette.removeCommand({
            label: 'Import today\'s comic from The Far Side'
        });
        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.unregisterCommand("FARSIDE");
        }
    }
}