import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OptionPieChart({ options = [] }) {
  if (!options || options.length === 0) {
    return <div className="text-xs text-slate-400 italic py-4">Chưa có dữ liệu</div>;
  }

  const palette = [
    '#003366', '#0B5394', '#F2B705', '#10B981', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#F97316', '#64748B'
  ];

  const labels = options.map(o => o.option_text);
  const dataValues = options.map(o => o.count);
  const backgroundColors = options.map((_, i) => palette[i % palette.length]);

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          },
          generateLabels: function(chart) {
            const original = ChartJS.overrides.doughnut.plugins.legend.labels.generateLabels(chart);
            return original.map((item, idx) => {
              const opt = options[idx];
              if (opt) {
                item.text = `${opt.option_text} (${opt.count} - ${opt.percentage}%)`;
              }
              return item;
            });
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const opt = options[context.dataIndex];
            return ` ${opt.option_text}: ${opt.count} lượt (${opt.percentage}%)`;
          }
        }
      }
    },
    cutout: '58%'
  };

  return (
    <div className="w-full">
      <div className="h-48 w-full flex items-center justify-center">
        <Doughnut data={data} options={chartOptions} />
      </div>
    </div>
  );
}
