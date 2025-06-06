import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type LogEntry = { text: string; isError: boolean };

const successLogs = [
  "root@linistrate$: SSH key scan completed for known_hosts",
  "root@linistrate$: Cron job '/usr/local/bin/db-backup.sh' executed with status 0",
  "root@linistrate$: iptables rules loaded from /etc/iptables/rules.v4",
  "root@linistrate$: lm-sensors: CPU temp: 42.3°C, Fan: 2200 RPM",
  "root@linistrate$: Daemon started successfully: /usr/sbin/linistrate-monitor",
  "root@linistrate$: Listening on TCP socket 0.0.0.0:22",
  "root@linistrate$: System uptime reported: 3 days, 14:12:34",
  "root@linistrate$: Loaded zram module for compressed RAM swap",
  "root@linistrate$: SSH login from 192.168.1.42: session opened for user root",
  "root@linistrate$: Discovered 14 assets in /srv/assets directory",
  "root@linistrate$: Successfully connected to PostgreSQL on port 5432",
  "root@linistrate$: cron.hourly completed with 0 errors",
  "root@linistrate$: rsync backup completed to /mnt/backup @ 03:00 UTC",
  "root@linistrate$: No orphaned Docker containers found",
  "root@linistrate$: Checking /etc/passwd: permissions 644, owner root",
  "root@linistrate$: cron.hourly completed with 0 errors",
  "root@linistrate$: Verifying credentials via PAM: Success",
  "root@linistrate$: tcpdump -n -i eth0 port 22 → 0 packets dropped",
  "root@linistrate$: ip addr show eth0 → inet 192.168.1.10/24 brd 192.168.1.255",
  "root@linistrate$: resolvectl status → DNS=8.8.8.8 1.1.1.1 LLMNR=no",
  "root@linistrate$: Installed updates: kernel 6.1.42, openssl 3.0.5",
  "root@linistrate$: UFW: Firewall loaded — default deny inbound, allow outbound",
  "root@linistrate$: lm-sensors: CPU temp: 42.3°C, Fan: 2200 RPM",
  "root@linistrate$: tcpdump -n -i eth0 port 22 → 0 packets dropped",
  "root@linistrate$: Checking /etc/passwd: permissions 644, owner root",
  "root@linistrate$: cron.hourly completed with 0 errors",
  "root@linistrate$: Audit log: secure access to /var/log/secure granted",
  "root@linistrate$: Successfully connected to PostgreSQL on port 5432",
  "root@linistrate$: Checking /etc/passwd: permissions 644, owner root",
  "root@linistrate$: Installed updates: kernel 6.1.42, openssl 3.0.5",
  "root@linistrate$: ping -c 3 8.8.8.8 → avg=11.4ms min=10.2ms max=12.3ms",
  "root@linistrate$: SSH login from 192.168.1.42: session opened for user root",
  "root@linistrate$: SSH key scan completed for known_hosts",
  "root@linistrate$: Verifying credentials via PAM: Success",
  "root@linistrate$: tcpdump -n -i eth0 port 22 → 0 packets dropped",
  "root@linistrate$: nginx service started on port 80",
  "root@linistrate$: Loaded zram module for compressed RAM swap",
  "root@linistrate$: iptables rules loaded from /etc/iptables/rules.v4",
  "root@linistrate$: GPG keyring loaded with 3 trusted keys",
  "root@linistrate$: Mounted /mnt/drive2 with UUID=abc123",
  "root@linistrate$: rsync backup completed to /mnt/backup @ 03:00 UTC",
  "root@linistrate$: SSH login from 192.168.1.42: session opened for user root",
  "root@linistrate$: UFW: Firewall loaded — default deny inbound, allow outbound",
  "root@linistrate$: RPC bind service active on portmapper",
  "root@linistrate$: systemctl start sshd.service → active (running)",
  "root@linistrate$: rsync backup completed to /mnt/backup @ 03:00 UTC",
  "root@linistrate$: Network interface wlan0 disabled (eth0 preferred)",
  "root@linistrate$: Cron job '/usr/local/bin/db-backup.sh' executed with status 0",
  "root@linistrate$: Loaded zram module for compressed RAM swap",
  "root@linistrate$: Mounted /mnt/drive2 with UUID=abc123",
  "root@linistrate$: systemctl start sshd.service → active (running)",
  "root@linistrate$: Network interface wlan0 disabled (eth0 preferred)",
  "root@linistrate$: lm-sensors: CPU temp: 42.3°C, Fan: 2200 RPM",
  "root@linistrate$: Launching Linistrate Agent in daemon mode...",
  "root@linistrate$: Listening on TCP socket 0.0.0.0:22",
  "root@linistrate$: Verified SSL certificate for linistrate.io — valid until 2026",
  "root@linistrate$: Mounted /mnt/drive2 with UUID=abc123",
  "root@linistrate$: UFW: Firewall loaded — default deny inbound, allow outbound",
  "root@linistrate$: Loading kernel modules: netfilter, overlay, veth, ip_tables...",
  "root@linistrate$: systemctl start sshd.service → active (running)",
  "root@linistrate$: Mounted /mnt/drive2 with UUID=abc123",
  "root@linistrate$: Mounting /dev/sda1 to / with ext4 filesystem...",
  "root@linistrate$: df -h /dev/sda1 → 35% used, 42G available",
  "root@linistrate$: Loaded docker container linistrate-api:latest",
  "root@linistrate$: Installed updates: kernel 6.1.42, openssl 3.0.5",
  "root@linistrate$: rsync backup completed to /mnt/backup @ 03:00 UTC",
  "root@linistrate$: arp -n → 192.168.1.1 at 00:11:22:33:44:55 on eth0 [ether]",
  "root@linistrate$: nginx service started on port 80",
  "root@linistrate$: UFW: Firewall loaded — default deny inbound, allow outbound",
  "root@linistrate$: Verified SSL certificate for linistrate.io — valid until 2026",
  "root@linistrate$: Cron job '/usr/local/bin/db-backup.sh' executed with status 0",
  "root@linistrate$: GPG keyring loaded with 3 trusted keys",
  "root@linistrate$: Loading kernel modules: netfilter, overlay, veth, ip_tables...",
  "root@linistrate$: Verified SSL certificate for linistrate.io — valid until 2026",
  "root@linistrate$: ClamAV security scan: 0 threats found in /home, /var, /etc",
  "root@linistrate$: RPC bind service active on portmapper",
  "root@linistrate$: iptables rules loaded from /etc/iptables/rules.v4",
  "root@linistrate$: resolvectl status → DNS=8.8.8.8 1.1.1.1 LLMNR=no",
  "root@linistrate$: Successfully connected to PostgreSQL on port 5432",
  "root@linistrate$: Generating system entropy from /dev/hwrng...",
  "root@linistrate$: Verified SSL certificate for linistrate.io — valid until 2026",
  "root@linistrate$: rsync backup completed to /mnt/backup @ 03:00 UTC",
  "root@linistrate$: Listening on TCP socket 0.0.0.0:22",
  "root@linistrate$: UFW: Firewall loaded — default deny inbound, allow outbound",
  "root@linistrate$: tcpdump -n -i eth0 port 22 → 0 packets dropped",
  "root@linistrate$: ntpd synchronized to pool.ntp.org [time drift: +0.034s]",
  "root@linistrate$: Generating system entropy from /dev/hwrng...",
  "root@linistrate$: df -h /dev/sda1 → 35% used, 42G available",
  "root@linistrate$: df -h /dev/sda1 → 35% used, 42G available",
  "root@linistrate$: nginx service started on port 80",
  "root@linistrate$: Cron job '/usr/local/bin/db-backup.sh' executed with status 0",
  "root@linistrate$: Loaded zram module for compressed RAM swap",
  "root@linistrate$: Checking systemd unit dependencies — all satisfied",
  "root@linistrate$: SSH login from 192.168.1.42: session opened for user root",
  "root@linistrate$: ping -c 3 8.8.8.8 → avg=11.4ms min=10.2ms max=12.3ms",
  "root@linistrate$: SSH key scan completed for known_hosts",
  "root@linistrate$: Installed updates: kernel 6.1.42, openssl 3.0.5",
  "root@linistrate$: nginx service started on port 80",
  "root@linistrate$: Launching Linistrate Agent in daemon mode...",
  "root@linistrate$: Loading kernel modules: netfilter, overlay, veth, ip_tables..."
];

const failureLogs = [
  "root@linistrate$: ERROR: Invalid/Duplicate username",
  "root@linistrate$: System warning: CPU temp high at 89°C",
  "root@linistrate$: Could not initialize agent: config file not found",
  "root@linistrate$: ntpd: time drift exceeds threshold, sync aborted",
  "root@linistrate$: Kernel panic: Attempted to kill init!",
  "root@linistrate$: fsck: unrecoverable error in inode table",
  "root@linistrate$: docker-compose up: volume mount error",
  "root@linistrate$: OOM Killer triggered: process apache2 killed",
  "root@linistrate$: Segmentation fault in daemon 'monitor'",
  "root@linistrate$: zram: unable to create swap device",
  "root@linistrate$: x509: certificate expired",
  "root@linistrate$: fsck: unrecoverable error in inode table",
  "root@linistrate$: zram: unable to create swap device",
  "root@linistrate$: Missing dependencies: glibc >= 2.34",
  "root@linistrate$: swapfile: write error, disk I/O failed",
  "root@linistrate$: Segmentation fault in daemon 'monitor'",
  "root@linistrate$: swapfile: write error, disk I/O failed",
  "root@linistrate$: OOM Killer triggered: process apache2 killed",
  "root@linistrate$: No space left on device — /var/log full",
  "root@linistrate$: auditd: queue overflow — 64 events lost",
  "root@linistrate$: nfs: server not responding, still trying...",
  "root@linistrate$: Service 'ssh' failed to start: Port 22 already in use",
  "root@linistrate$: Error reading journal logs: corrupted index file",
  "root@linistrate$: Unexpected kernel trap at RIP: 0xffffffff810aa9c2",
  "root@linistrate$: Cron job '/usr/bin/backup.sh' failed: Permission denied",
  "root@linistrate$: UFW blocked incoming connection on port 22 from 203.0.113.77",
  "root@linistrate$: Disk /dev/sda1: Filesystem check failed — mounting in read-only mode",
  "root@linistrate$: Permission denied accessing /etc/shadow",
  "root@linistrate$: Kernel panic: Attempted to kill init!",
  "root@linistrate$: User 'nobody' tried sudo: permission denied",
  "root@linistrate$: Could not initialize agent: config file not found",
  "root@linistrate$: Could not allocate memory — malloc failed",
  "root@linistrate$: Authentication failed: Incorrect password",
  "root@linistrate$: ARP conflict detected for IP 192.168.1.10",
  "root@linistrate$: Missing dependencies: glibc >= 2.34",
  "root@linistrate$: Read-only file system error on /tmp",
  "root@linistrate$: docker-compose up: volume mount error",
  "root@linistrate$: Audit log: Failed login attempt detected",
  "root@linistrate$: NetworkManager error: eth0 link is down",
  "root@linistrate$: ntpd: time drift exceeds threshold, sync aborted",
  "root@linistrate$: iptables-restore: line 15 failed",
  "root@linistrate$: Could not initialize agent: config file not found",
  "root@linistrate$: Failed to synchronize time: NTP server unreachable",
  "root@linistrate$: nginx: failed to bind to port 80 — permission denied",
  "root@linistrate$: nfs: server not responding, still trying...",
  "root@linistrate$: Authentication failed: Incorrect password",
  "root@linistrate$: journalctl --verify: invalid CRC on entry 2023",
  "root@linistrate$: Cron job '/usr/bin/backup.sh' failed: Permission denied",
  "root@linistrate$: rsync: connection refused to 10.0.0.12",
  "root@linistrate$: Critical: Could not resolve DNS for updates",
  "root@linistrate$: Failed to synchronize time: NTP server unreachable",
  "root@linistrate$: swapfile: write error, disk I/O failed",
  "root@linistrate$: Cron job '/usr/bin/backup.sh' failed: Permission denied",
  "root@linistrate$: OOM Killer triggered: process apache2 killed",
  "root@linistrate$: Failed to synchronize time: NTP server unreachable",
  "root@linistrate$: Could not allocate memory — malloc failed",
  "root@linistrate$: fsck: unrecoverable error in inode table",
  "root@linistrate$: Kernel panic: Attempted to kill init!",
  "root@linistrate$: zram: unable to create swap device",
  "root@linistrate$: Firewall alert: Unauthorized access attempt from 192.168.1.50",
  "root@linistrate$: Missing dependencies: glibc >= 2.34",
  "root@linistrate$: Could not initialize agent: config file not found",
  "root@linistrate$: ARP conflict detected for IP 192.168.1.10",
  "root@linistrate$: rsync: connection refused to 10.0.0.12",
  "root@linistrate$: Device eth0 does not exist",
  "root@linistrate$: Service 'ssh' failed to start: Port 22 already in use",
  "root@linistrate$: Firewall alert: Unauthorized access attempt from 192.168.1.50",
  "root@linistrate$: Service 'ssh' failed to start: Port 22 already in use",
  "root@linistrate$: Critical: Could not resolve DNS for updates",
  "root@linistrate$: systemctl restart failed: unit not found",
  "root@linistrate$: NetworkManager error: eth0 link is down",
  "root@linistrate$: ARP conflict detected for IP 192.168.1.10",
  "root@linistrate$: Audit log: Failed login attempt detected",
  "root@linistrate$: Service 'ssh' failed to start: Port 22 already in use",
  "root@linistrate$: Permission denied accessing /etc/shadow",
  "root@linistrate$: rsync: connection refused to 10.0.0.12",
  "root@linistrate$: Critical: Could not resolve DNS for updates",
  "root@linistrate$: SSL handshake failed — self-signed certificate",
  "root@linistrate$: Access denied: Invalid credentials provided",
  "root@linistrate$: journalctl --verify: invalid CRC on entry 2023",
  "root@linistrate$: nfs: server not responding, still trying...",
  "root@linistrate$: ARP conflict detected for IP 192.168.1.10",
  "root@linistrate$: logrotate: compression failed on /var/log/auth.log",
  "root@linistrate$: Error reading journal logs: corrupted index file",
  "root@linistrate$: systemd: Dependency failed for NetworkManager",
  "root@linistrate$: nginx: failed to bind to port 80 — permission denied",
  "root@linistrate$: systemd: Dependency failed for NetworkManager",
  "root@linistrate$: Firewall alert: Unauthorized access attempt from 192.168.1.50",
  "root@linistrate$: Device eth0 does not exist",
  "root@linistrate$: nfs: server not responding, still trying...",
  "root@linistrate$: fsck: unrecoverable error in inode table",
  "root@linistrate$: ARP conflict detected for IP 192.168.1.10",
  "root@linistrate$: zram: unable to create swap device",
  "root@linistrate$: Disk /dev/sda1: Filesystem check failed — mounting in read-only mode",
  "root@linistrate$: shutdown: scheduled by unknown user",
  "root@linistrate$: Firewall alert: Unauthorized access attempt from 192.168.1.50",
  "root@linistrate$: Kernel panic: Attempted to kill init!",
  "root@linistrate$: mount: unknown filesystem type 'xfs'",
  "root@linistrate$: Unexpected kernel trap at RIP: 0xffffffff810aa9c2",
  "root@linistrate$: Could not allocate memory — malloc failed",
  "root@linistrate$: swapfile: write error, disk I/O failed"
];

const EnhancedRegister = () => {
  const [username, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [baseLogs, setBaseLogs] = useState<LogEntry[]>([]);
  const [typedLogs, setTypedLogs] = useState<LogEntry[]>([]);
  const [typingIndex, setTypingIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [currentLogSet, setCurrentLogSet] = useState<'success' | 'failure'>('success');

  const containerRef = useRef<HTMLDivElement>(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // On mount: fill background with success logs
  useEffect(() => {
    const logs: LogEntry[] = [];
    for (let i = 0; i < 60; i++) {
      logs.push({ text: successLogs[i % successLogs.length], isError: false });
    }
    setBaseLogs(logs);
  }, []);

  // Typing animation
  useEffect(() => {
    const logArray = currentLogSet === 'failure' ? failureLogs : successLogs;
    if (typingIndex >= logArray.length) return;

    const currentText = logArray[typingIndex];
    const isError = currentLogSet === 'failure';

    if (charIndex < currentText.length) {
      const timer = setTimeout(() => {
        setTypedLogs((prev) => {
          const updated = [...prev];
          if (!updated[typingIndex])
            updated[typingIndex] = { text: '', isError };
          updated[typingIndex].text += currentText[charIndex];
          return updated;
        });
        setCharIndex((prev) => prev + 1);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        // Push completed line into baseLogs
        setBaseLogs((prev) => [...prev.slice(1), {
          text: typedLogs[typingIndex]?.text || currentText,
          isError,
        }]);
        setTypingIndex((prev) => prev + 1);
        setCharIndex(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [charIndex, typingIndex, currentLogSet, typedLogs]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [typedLogs, baseLogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset typing animation
    setTypedLogs([]);
    setTypingIndex(0);
    setCharIndex(0);

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are identical.",
        variant: 'destructive',
      });
      setCurrentLogSet('failure');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      toast({
        title: 'Account created!',
        description: 'Welcome to Linistrate.',
      });
      setCurrentLogSet('success');
      setTypedLogs([{ text: 'useradd[1001]: Registration successful - Welcome new user', isError: false }]);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch {
      toast({
        title: 'Registration failed',
        description: 'Please try again with a different username.',
        variant: 'destructive',
      });
      setCurrentLogSet('failure');
      setTypedLogs([{ text: 'systemd[register]: Registration failed - Invalid or duplicate user', isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 relative flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Terminal-style log background */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full overflow-hidden p-4 font-mono text-sm leading-relaxed bg-black"
      >
        {baseLogs.map((log, i) => (
          <div key={`base-${i}`} className={log.isError ? "text-red-500" : "text-green-500"}>
            {log.text}
          </div>
        ))}
        {typedLogs.map((log, i) => (
          <div key={`typed-${i}`} className={log.isError ? "text-red-500" : "text-green-500"}>
            {log.text}
          </div>
        ))}
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md z-10 animate-fade-in">
        <Card className="border border-gray-700 bg-black/70 backdrop-blur-md shadow-xl rounded-2xl">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-3xl font-bold text-green-400">Join Linistrate</CardTitle>
            <CardDescription className="text-gray-400">
              Create your Linux automation account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Username</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="root"
                  value={username}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-green-400 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedRegister;
