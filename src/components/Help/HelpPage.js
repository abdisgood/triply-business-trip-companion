import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Link,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Phone as PhoneIcon,
  Article as ArticleIcon,
  School as SchoolIcon,
  QuestionAnswer as FAQIcon,
} from '@mui/icons-material';

const HelpPage = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(false);

  const faqs = [
    {
      question: 'How do I create a new trip?',
      answer: 'Click the "Create Trip" button on your dashboard. Fill in the trip details including title, dates, and destinations. You can then add companies, team members, and scheduled actions.'
    },
    {
      question: 'What are AI credits used for?',
      answer: 'AI credits are used for various AI-powered features like generating trip summaries, expense categorization, meeting notes transcription, and intelligent recommendations. Each feature consumes a certain number of credits.'
    },
    {
      question: 'How do I invite team members to a trip?',
      answer: 'Open your trip details and click on "Invite Team Members". Enter their email addresses and they will receive an invitation to join your trip. They need to have an account to accept the invitation.'
    },
    {
      question: 'Can I sync my trips with my calendar?',
      answer: 'Yes! Go to Settings > Calendar Integration and enable calendar sync. You can choose between Google Calendar, Outlook, or Apple Calendar. Your trips and scheduled actions will automatically appear in your calendar.'
    },
    {
      question: 'How do I track expenses for a trip?',
      answer: 'Navigate to your trip and click on the "Expenses" tab. You can add receipts, categorize expenses, and track your budget. The expense feature will be fully available soon.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We use Firebase for authentication and data storage, which provides enterprise-level security. You can also export or delete your data at any time from the Settings page.'
    }
  ];

  const supportChannels = [
    {
      icon: <EmailIcon sx={{ fontSize: 40 }} />,
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      action: 'support@triply.com',
      color: 'primary',
    },
    {
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: 'Coming Soon',
      color: 'success',
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 40 }} />,
      title: 'Phone Support',
      description: 'Premium support for enterprise',
      action: 'Contact Sales',
      color: 'warning',
    },
  ];

  const resources = [
    {
      icon: <ArticleIcon />,
      title: 'Documentation',
      description: 'Detailed guides and API docs',
    },
    {
      icon: <SchoolIcon />,
      title: 'Video Tutorials',
      description: 'Learn with step-by-step videos',
    },
    {
      icon: <FAQIcon />,
      title: 'Community Forum',
      description: 'Get help from other users',
    },
  ];

  const handleFAQChange = (panel) => (event, isExpanded) => {
    setExpandedFAQ(isExpanded ? panel : false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Help & Support
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Find answers to your questions and get help with Triply
      </Typography>

      {/* Support Channels */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Contact Support
      </Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {supportChannels.map((channel, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Box sx={{ color: `${channel.color}.main`, mb: 2 }}>
                  {channel.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {channel.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {channel.description}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {channel.action}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FAQs */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Frequently Asked Questions
      </Typography>
      <Paper sx={{ mb: 5 }}>
        {faqs.map((faq, index) => (
          <Accordion
            key={index}
            expanded={expandedFAQ === `panel${index}`}
            onChange={handleFAQChange(`panel${index}`)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* Resources */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Resources
      </Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {resources.map((resource, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper sx={{ p: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
              <Box sx={{ color: 'primary.main', mb: 2 }}>
                {resource.icon}
              </Box>
              <Typography variant="h6" gutterBottom>
                {resource.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {resource.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Contact Form */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Send us a Message
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Your Name"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Subject"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Message"
              variant="outlined"
              multiline
              rows={4}
              placeholder="Describe your issue or question..."
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" size="large">
              Send Message
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Links */}
      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Need immediate help? Check our{' '}
          <Link href="#" underline="hover">
            status page
          </Link>{' '}
          or{' '}
          <Link href="#" underline="hover">
            developer API
          </Link>
          .
        </Typography>
      </Box>
    </Container>
  );
};

export default HelpPage;