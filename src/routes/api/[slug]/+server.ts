export async function GET({ fetch, params }) {
    try {
        const paramsArray = params.slug.split(' ');

        const book = paramsArray[0];
        const chapter = paramsArray[1];
        const version = paramsArray[2];

        const refresponse = await fetch(`https://jsonBible.com/search/ref.php?keyword=${book}%20${chapter}`);
        if (!refresponse.ok) {
            throw new Error('Failed to fetch reference data');
        }

        const refData = await refresponse.json();
        refData.version = version;

        const refJsonString = JSON.stringify(refData);


        const verseResponse = await fetch(`https://jsonBible.com/search/verses.php?json=${encodeURIComponent(refJsonString)}`);
        if (!verseResponse.ok) {
            throw new Error('Failed to fetch verse data');
        }

        const jsonData = await verseResponse.json();



        const newResponse = new Response(JSON.stringify(jsonData), {
            headers: { 'Content-Type': 'application/json' },
        });

        return newResponse;
    } catch (error) {
        console.error('Error fetching data:', error);

    }
}
