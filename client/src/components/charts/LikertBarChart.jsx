import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function LikertBarChart({ stats, questionText }) {
  if (!stats || !stats.distribution) {
    return <div className="text-xs text-slate-400 italic py-4">Chưa có đủ dữ liệu phản hồi</div>;
  }

  const labels = [
    '1. Rất không hài lòng',
    '2. Không hài lòng',
    '3. Bình thường',
    '4. Hài lòng',
    '5. Rất hài lòng'
  ];

  const dataValues = [
    stats.distribution[1] || 0,
    stats.distribution[2] || 0,
    stats.distribution[3] || 0,
    stats.distribution[4] || 0,
    stats.distribution[5] || 0
  ];

  const backgroundColors = [
    '#EF4444', // Đỏ - Rất không hài lòng
    '#F97316', // Cam - Không hài lòng
    '#FBBF24', // Vàng - Bình thường
    '#3B82F6', // Xanh dương - Hài lòng
    '#10B981'  // Xanh lá - Rất hài lòng
  ];

  const data = {
    labels,
    datasets: [
      {
        label: 'Số lượng sinh viên chọn',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const val = context.raw;
            const percentage = stats.percentages[context.dataIndex + 1] || 0;
            return ` ${val} sinh viên (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0
        },
        grid: {
          color: '#F1F5F9'
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            weight: 500
          }
        }
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Phân bố thang đo 1 – 5 sao
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-900">
          ⭐ Điểm trung bình: <span className="text-base text-dlu-primary font-black">{stats.average_score}</span> / 5.0
        </div>
      </div>
      <div className="h-44 w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
