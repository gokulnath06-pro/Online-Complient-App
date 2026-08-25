const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined,
  });

  const data = await response.json();
  return { status: response.status, data };
}

async function runIntegrationTests() {
  console.log('🧪 Starting Full-Stack API & Workflow Integration Tests...\n');
  let testsPassed = 0;
  let testsTotal = 0;

  function assert(condition, name) {
    testsTotal++;
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      testsPassed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
      process.exitCode = 1;
    }
  }

  try {
    // 1. Health check
    const health = await request('/health', { method: 'GET' });
    assert(health.data.status === 'ok', 'Health check responds 200 OK');

    // 2. User Login
    const userLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'john@user.com', password: 'user123' },
    });
    assert(userLogin.data.success === true && userLogin.data.token, 'User authentication & JWT token issuance');
    const userToken = userLogin.data.token;
    const userHeaders = { Authorization: `Bearer ${userToken}` };

    // 3. Agent Login
    const agentLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'agent.tech@complaint.com', password: 'agent123' },
    });
    assert(agentLogin.data.user.role === 'AGENT', 'Agent authentication with role verification');
    const agentToken = agentLogin.data.token;
    const agentHeaders = { Authorization: `Bearer ${agentToken}` };

    // 4. Admin Login
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@complaint.com', password: 'admin123' },
    });
    assert(adminLogin.data.user.role === 'ADMIN', 'Admin authentication with role verification');
    const adminToken = adminLogin.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 5. User creates a new complaint
    const newComplaintRes = await request('/complaints', {
      method: 'POST',
      headers: userHeaders,
      body: {
        title: 'Network latency spike on US-East Kubernetes nodes',
        category: 'Technical',
        priority: 'High',
        description: 'Observed intermittent network packet drops exceeding 12% across worker pods in us-east-1.',
      },
    });
    assert(
      newComplaintRes.data.success === true && newComplaintRes.data.complaint.ticketId.startsWith('TKT-'),
      `Complaint creation with generated Ticket ID: ${newComplaintRes.data.complaint.ticketId}`
    );
    const createdComplaintId = newComplaintRes.data.complaint._id;

    // 6. Admin lists complaints & assigns agent
    const assignRes = await request(`/complaints/${createdComplaintId}/assign`, {
      method: 'PUT',
      headers: adminHeaders,
      body: { agentId: agentLogin.data.user._id },
    });
    assert(
      assignRes.data.complaint.status === 'Assigned' && assignRes.data.complaint.assignedAgent._id === agentLogin.data.user._id,
      'Admin ticket assignment to support agent'
    );

    // 7. User sends a live chat message
    const msgRes = await request(`/messages/${createdComplaintId}`, {
      method: 'POST',
      headers: userHeaders,
      body: { message: 'Hello Agent, attaching traceroute logs for your inspection.' },
    });
    assert(msgRes.data.success === true && msgRes.data.message.message.includes('traceroute'), 'User sends ticket chat message');

    // 8. Agent replies in chat
    const agentMsgRes = await request(`/messages/${createdComplaintId}`, {
      method: 'POST',
      headers: agentHeaders,
      body: { message: 'Received! Checking DNS resolver cluster latency.' },
    });
    assert(agentMsgRes.data.message.senderRole === 'AGENT', 'Agent replies in ticket chat');

    // 9. Agent moves status to In Progress
    const inProgressRes = await request(`/complaints/${createdComplaintId}/status`, {
      method: 'PUT',
      headers: agentHeaders,
      body: { status: 'In Progress', note: 'Investigating core router gateway.' },
    });
    assert(inProgressRes.data.complaint.status === 'In Progress', 'Agent updates complaint status to In Progress');

    // 10. Agent resolves ticket
    const resolveRes = await request(`/complaints/${createdComplaintId}/status`, {
      method: 'PUT',
      headers: agentHeaders,
      body: {
        status: 'Resolved',
        resolutionNotes: 'Flushed corrupted ARP cache and scaled ingress gateway instances.',
      },
    });
    assert(resolveRes.data.complaint.status === 'Resolved', 'Agent resolves complaint with notes');

    // 11. User submits 5-star feedback
    const feedbackRes = await request(`/feedback/${createdComplaintId}`, {
      method: 'POST',
      headers: userHeaders,
      body: {
        rating: 5,
        speedRating: 5,
        serviceRating: 5,
        comment: 'Outstanding turnaround time and expert root cause diagnosis!',
        tags: ['Lightning Fast', 'Clear Solution'],
      },
    });
    assert(feedbackRes.data.success === true && feedbackRes.data.feedback.rating === 5, 'User submits 5-star resolution feedback');

    // 12. Public Tracker lookup
    const publicTrackRes = await request(`/complaints/track/${newComplaintRes.data.complaint.ticketId}`, {
      method: 'GET',
    });
    assert(
      publicTrackRes.data.complaint.status === 'Resolved',
      'Public ticket tracking lookup by Ticket ID'
    );

    // 13. Admin Analytics Dashboard Data
    const analyticsRes = await request('/analytics/dashboard', {
      method: 'GET',
      headers: adminHeaders,
    });
    assert(
      analyticsRes.data.metrics.totalComplaints >= 5 && analyticsRes.data.metrics.resolutionRate > 0,
      'Admin analytics KPIs and category aggregations'
    );

    console.log(`\n🎉 Test Suite Completed: ${testsPassed}/${testsTotal} tests passed successfully!\n`);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
}

runIntegrationTests();
