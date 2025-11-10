# 🌿 Cannabis Fantasy League

A comprehensive fantasy sports platform for the cannabis industry, featuring real-time drafts, weekly scoring, matchups, standings, and multiplayer functionality.

## 🎯 Features

### Core Functionality
- **League Management** - Create and manage fantasy leagues
- **Live Draft System** - Real-time snake/linear drafts with WebSocket support
- **Weekly Scoring** - Automated scoring based on real cannabis industry data
- **Matchups & Standings** - Head-to-head competition with playoff brackets
- **Email Invitations** - SendGrid-powered multiplayer invitations

### Player Categories
- **Manufacturers** - Cannabis product manufacturers
- **Strains** - Cannabis strain genetics
- **Products** - Individual cannabis products
- **Pharmacies** - Dispensaries and retail locations

### Advanced Features
- **Real-time Updates** - WebSocket broadcasting for live events
- **Scoring Engine** - Automated weekly calculations
- **Playoff System** - 4-team and 6-team bracket support
- **Email Notifications** - Draft alerts, scoring updates, invitations
- **Responsive UI** - Mobile-friendly design

## 🚀 Tech Stack

### Frontend
- **React** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **tRPC** - Type-safe API client
- **React Query** - Data fetching

### Backend
- **Node.js** + **TypeScript**
- **Express** - Web framework
- **tRPC** - Type-safe API
- **Drizzle ORM** - Database ORM
- **MySQL** - Database
- **WebSocket** - Real-time communication
- **SendGrid** - Email service

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/justinhartfield/cannabis-fantasy-league.git
cd cannabis-fantasy-league

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
mysql -u root -p < schema.sql

# Build application
npm run build

# Start server
node dist/index.js
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/cannabis_fantasy_league

# SendGrid Email
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@cannabis-fantasy-league.com

# Application
APP_URL=http://localhost:3001
NODE_ENV=production
```

## 📖 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **SCORING_ENGINE_COMPLETE.md** - Scoring system documentation
- **MATCHUPS_STANDINGS_COMPLETE.md** - Matchups and standings guide
- **SENDGRID_EMAIL_INTEGRATION_COMPLETE.md** - Email integration guide
- **DRAFT_IMPROVEMENTS_IMPLEMENTATION.md** - Draft system details
- **PLAYER_LOADING_FINAL_REPORT.md** - Player loading verification

## 🎮 Usage

### For Commissioners

1. **Create League**
   - Set league name and settings
   - Configure draft type and scoring

2. **Invite Members**
   - Send email invitations
   - Track invitation status

3. **Start Draft**
   - Set draft date/time
   - Manage draft order

4. **Manage Season**
   - View matchups
   - Check standings
   - Monitor scoring

### For League Members

1. **Accept Invitation**
   - Click email link
   - Create team name
   - Join league

2. **Participate in Draft**
   - Join draft room
   - Draft your roster

3. **Manage Team**
   - Set weekly lineups
   - View scoring breakdowns

4. **Compete**
   - Track matchups
   - Check standings
   - Aim for playoffs

## 🏗️ Project Structure

```
cannabis-fantasy-league/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── _core/         # Core utilities
├── server/                # Backend Node.js application
│   ├── _core/            # Core server setup
│   ├── *Router.ts        # tRPC routers
│   ├── emailService.ts   # Email service
│   ├── scoringEngine.ts  # Scoring calculations
│   └── websocket.ts      # WebSocket manager
├── drizzle/              # Database schema
├── docs/                 # Documentation
└── dist/                 # Built application
```

## 🧪 Testing

```bash
# Run tests (if available)
npm test

# Build and verify
npm run build

# Start development server
npm run dev
```

## 📊 Database Schema

### Core Tables
- `users` - User accounts
- `leagues` - Fantasy leagues
- `teams` - League teams
- `rosters` - Team rosters
- `matchups` - Weekly matchups
- `weeklyTeamScores` - Scoring data
- `invitations` - Email invitations

### Player Tables
- `manufacturers` - Cannabis manufacturers
- `cannabisStrains` - Strain genetics
- `strains` - Product strains
- `pharmacies` - Dispensaries

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with modern web technologies
- Powered by SendGrid for email delivery
- Real-time features via WebSocket
- Type-safe APIs with tRPC

## 📞 Support

For issues or questions:
- **GitHub Issues**: https://github.com/justinhartfield/cannabis-fantasy-league/issues
- **Documentation**: See `/docs` directory

---

**Built with ❤️ for the cannabis fantasy sports community**
