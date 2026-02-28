const url = "https://ztyhcnkgdiegcoclpdkx.supabase.co/rest/v1/rpc/";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWhjbmtnZGllZ2NvY2xwZGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MzI5NDcsImV4cCI6MjA4NzMwODk0N30.oDm6qZJsQXeuMsIb4rdFmIB5zb5qf4Og8KS1ZqYvj_U";

// Try to query the table to see if it exists
fetch("https://ztyhcnkgdiegcoclpdkx.supabase.co/rest/v1/course_schedules?select=id&limit=1", {
    headers: { "apikey": key, "Authorization": "Bearer " + key }
}).then(r => {
    if (r.status === 200) {
        console.log("Table already exists!");
    } else {
        r.text().then(t => {
            console.log("Status:", r.status, "Need to create table via Supabase Dashboard SQL Editor");
            console.log(t);
        });
    }
});
