import Chart from "chart.js/auto";
import { useEffect } from "react";
export { LineChart };

function LineChart({ twitterData }) {
    useEffect(() => {
        const ctx = document.getElementById("lineChart").getContext("2d");

        const labels = twitterData.dates;
        const data = {
            labels: labels,
            datasets: [
                {
                    data: twitterData.seven_day_followers,
                    label: "Followers",
                    fill: true,
                    backgroundColor: "rgb(57, 125, 162, 0.1)",
                    showLine: true,
                    borderColor: "rgb(255, 255, 255,0.5)",
                    borderWidth: 1,
                },
            ],
        };
        const config = {
            type: "line",
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
            },
        };

        const lineChart = new Chart(ctx, config);

        return () => {
            lineChart.destroy();
        };
    }, [twitterData]);

    return (
        <>
            <canvas id="lineChart"></canvas>"
        </>
    );
}
