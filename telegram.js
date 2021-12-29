import fetch from 'node-fetch';

const telegramBotToken = '5012802656:AAEfnQ3YQMxfeOK75G-UdaZrW6NZ7v5Otmg';

export const getTokenizedQuery = query => {
    return query.replace("$", telegramBotToken);
}

const getUpdates = () => {
    fetch(getTokenizedQuery("https://api.telegram.org/bot$/getUpdates")).then(async (res) => {
        const body = await res.json();
        console.log("api res body", body.result[0].message);
    })
}

// const response = await fetch(getTokenizedQuery("https://api.telegram.org/bot$/sendMessage?chat_id=362089091&text=Hello"));
// const body = await response.text();
// console.log("api response", body);

// const response = await fetch(getTokenizedQuery("https://api.telegram.org/bot$/getMe"));
// const body = await response.text();
// console.log("api response", body);

// getUpdates();