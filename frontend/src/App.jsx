import React, { useState, useEffect } from 'react';
import ProfileHeader from './components/Header/ProfileHeader';
import AboutSection from './components/About/AboutSection';
import ProjectsSection from './components/Projects/ProjectsSection';
import CertificationsCarousel from './components/Certifications/CertificationsCarousel';
import GitHubCalendarGrid from './components/Calendar/GitHubCalendarGrid';
import ScheduleMeetingModal from './components/Modals/ScheduleMeetingModal';
import DownloadCVModal from './components/Modals/DownloadCVModal';
import JoinCommunityModal from './components/Modals/JoinCommunityModal';
import { fetchGitHubOverview, fetchGitHubCalendar } from './services/api';

export default function App() {
  const [overviewData, setOverviewData] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isCVOpen, setIsCVOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  useEffect(() => {
    async function loadTelemetry() {
      try {
        setLoading(true);
        const [overview, calendar] = await Promise.all([
          fetchGitHubOverview('myrson2'),
          fetchGitHubCalendar('myrson2'),
        ]);
        setOverviewData(overview);
        setCalendarData(calendar);
      } catch (err) {
        console.error('Telemetry loading error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTelemetry();
  }, []);

  return (
    <div className="portfolio-app">
      <div className="portfolio-container">
        {/* Profile Header with Banner & 3 CTAs */}
        <ProfileHeader
          onScheduleMeeting={() => setIsMeetingOpen(true)}
          onDownloadCV={() => setIsCVOpen(true)}
          onJoinCommunity={() => setIsCommunityOpen(true)}
          status={overviewData?.status || 'Online'}
        />

        {/* Two-Column Editorial Stream */}
        <main>
          {/* About Section */}
          <AboutSection overviewData={overviewData} />

          {/* Projects Section */}
          <ProjectsSection />

          {/* Certifications Section */}
          <section className="editorial-section" id="certifications">
            <div className="editorial-label">Certifications</div>
            <div className="editorial-content">
              <CertificationsCarousel />
            </div>
          </section>

          {/* GitHub Contributions Section (Separate Full Main Width) */}
          <section className="contributions-section" id="contributions">
            <div className="contributions-header">
              <div className="editorial-label">Contributions</div>
              <span className="text-secondary small font-monospace">
                Activity Heat Map • @myrson2
              </span>
            </div>
            <GitHubCalendarGrid calendarData={calendarData} loading={loading} />
          </section>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-secondary small border-top mt-5 font-monospace">
          © {new Date().getFullYear()} Jose Myrson O. Beros. All rights reserved.
        </footer>
      </div>

      {/* Interactive CTA Modals */}
      <ScheduleMeetingModal
        isOpen={isMeetingOpen}
        onClose={() => setIsMeetingOpen(false)}
      />
      <DownloadCVModal
        isOpen={isCVOpen}
        onClose={() => setIsCVOpen(false)}
      />
      <JoinCommunityModal
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
      />
    </div>
  );
}

