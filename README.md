# 🌐 Modern Visual IPv4 Subnet Designer

A powerful, intuitive web application fo### Sharing Your Designs
- **Generate Shareable Links**: Click the "Share" button to use device sharing options or "Copy Link" to copy to clipboard
- **Preserve State**: Shared links maintain your entire network hierarchy and selections
- **Cross-Platform**: Works on any device with a modern web browser
- **Multiple Sharing Options**: Choose between native sharing or direct link copyingigning, visualizing, and managing IPv4 network hierarchies with advanced subnetting capabilities.

![IPv4 Subnet Designer](https://img.shields.io/badge/React-18.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-blue) ![Vite](https://img.shields.io/badge/Vite-4.4.0-yellow)

## ✨ Features

### 🎯 Core Functionality
- **Interactive Network Design**: Create and manage complex IPv4 network hierarchies
- **Real-time Visualization**: Beautiful, expandable tree view of your network structure
- **Advanced Subnetting**: Multiple division methods (by prefix, subnets, or hosts)
- **Smart Calculations**: Automatic IP address calculations and subnet mask generation
- **Shareable Links**: Generate URLs that preserve your entire network design for sharing

### 🎨 User Experience
- **Modern UI**: Clean, responsive design with smooth animations
- **Quick Actions**: One-click subnet division with multiple preset options
- **Expandable Hierarchy**: Collapse/expand network sections for better navigation
- **Visual Feedback**: Real-time updates and success notifications
- **Mobile Friendly**: Fully responsive design for all devices

### 🎨 User Experience
- **Modern UI**: Clean, responsive design with smooth animations
- **Quick Actions**: One-click subnet division with multiple preset options
- **Expandable Hierarchy**: Collapse/expand network sections for better navigation
- **Visual Feedback**: Real-time updates and success notifications
- **Mobile Friendly**: Fully responsive design for all devices

### 📊 Data Management
- **CSV Export**: Export your network designs to CSV for documentation and analysis
- **Persistent State**: Maintain your work across sessions
- **Reset Functionality**: Start fresh with one click
- **Detailed Information**: Comprehensive subnet details and statistics

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/modern-visual-ipv4-subnet-designer.git
   cd modern-visual-ipv4-subnet-designer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 Usage Guide

### Getting Started
1. **Enter Initial Network**: Start by entering a CIDR notation (e.g., `192.168.1.0/24`)
2. **View Details**: Click on any subnet to see detailed information
3. **Divide Networks**: Use the quick action buttons or custom divide options

### Division Methods
- **Split in Half**: Creates 2 equal subnets by increasing prefix by 1
- **4 Subnets**: Divides into 4 equal subnets
- **30 Hosts**: Creates subnets optimized for 30 usable hosts each
- **Custom**: Advanced options for specific requirements

### Navigation Features
- **Expand/Collapse**: Click chevron icons to show/hide subnet children
- **Bulk Actions**: Expand All / Collapse All buttons for quick navigation
- **Search & Select**: Click any subnet to view its details and options
- **Share Designs**: Use the Share button to generate URLs that preserve your network design

### Sharing Your Designs
- **Generate Shareable Links**: Click the "Share" button to use device sharing options or "Copy Link" to copy to clipboard
- **Shorten URLs**: Use "Short Link" button to generate compact URLs using free shortening services
- **Preserve State**: Shared links maintain your entire network hierarchy and selections
- **Cross-Platform**: Works on any device with a modern web browser
- **Multiple Sharing Options**: Choose between native sharing, direct copying, or shortened links

## 🛠️ Technical Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Build Tool**: Vite for fast development and optimized builds
- **Icons**: Lucide React for consistent iconography
- **State Management**: React hooks with custom subnetting logic

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Application header
│   ├── NetworkInputForm.tsx  # Initial network input
│   ├── SubnetVisualizer.tsx  # Main hierarchy display
│   ├── SubnetDetails.tsx     # Detailed subnet info
│   ├── OverallSummary.tsx    # Network statistics
│   └── QuickActions.tsx      # Quick divide actions
├── hooks/
│   └── useSubnetting.ts      # Main state management
├── types/
│   └── index.ts              # TypeScript definitions
├── utils/
│   └── ipv4Utils.ts          # IPv4 calculation utilities
└── App.tsx                   # Main application component
```

## 🎯 Key Components

### SubnetVisualizer
- Interactive tree view of network hierarchy
- Expandable/collapsible sections
- Quick divide buttons for each subnet
- CSV export functionality

### QuickActions
- Prominent divide action buttons
- Custom division form
- Real-time validation

### NetworkInputForm
- Initial network setup
- Reset configuration option
- Input validation

## 📊 CSV Export Format

Export your network designs with comprehensive data:

```csv
Network Hierarchy Export
Export Date,"August 29, 2025"
Total Subnets,"15"
Root Networks,"2"

CIDR,IP Address,Prefix,Network Address,Broadcast Address,Subnet Mask,Total IPs,Usable Hosts,Parent ID,Depth,Has Children
192.168.1.0/24,192.168.1.0,24,192.168.1.0,192.168.1.255,255.255.255.0,256,254,,0,Yes
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code style
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern React and TypeScript
- Inspired by network engineering needs
- Designed for both beginners and professionals

## 📞 Support

If you find this project helpful, please:
- ⭐ Star the repository
- 🐛 Report issues or bugs
- 💡 Suggest new features
- 📖 Share with others who might benefit

---

**Made with ❤️ for network engineers and IT professionals**
