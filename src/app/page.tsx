'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

// Define interface for member objects
interface Member {
  id: string | number;
  login: string;
  // Add other properties here if needed
}

export default function Home() {
  return <WorkshopContent />;
}

function WorkshopContent() {
  const [members, setMembers] = useState<Member[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [config, setConfig] = useState({ orgName: '', teamName: '' });
  const [filterText, setFilterText] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchMembers();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      setConfig(data);
    } catch {
      setMessage('获取配置信息失败');
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      const data = await response.json();
      if (Array.isArray(data)) {
        setMembers(data as Member[]); // Type assertion to ensure type safety
      } else if (data.error) {
        setMessage(data.error);
      } else {
        setMessage('获取成员列表失败');
        console.error('Expected array but received:', data);
      }
    } catch {
      setMessage('获取成员列表失败');
    }
  };

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username) {
      setMessage('请输入用户名');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`成功为 ${username} 发送邀请, 接下来请进入您的 GitHub 组织页面接受邀请。`);
        setUsername('');
        fetchMembers(); // 刷新成员列表
      } else {
        setMessage(data.error || '邀请失败');
      }
    } catch {
      setMessage('邀请过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 根据过滤文本筛选成员
  const filteredMembers = filterText
    ? members.filter(member => 
        member.login.toLowerCase().includes(filterText.toLowerCase()))
    : members;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <h1 className={styles.title}>Join GitHub Copilot Workshop</h1>
          
          <div className={styles.contentWrapper}>
            {/* 左侧内容: 工作区信息和介绍/操作指南 */}
            <div className={styles.leftColumn}>
              {/* 工作区信息移到左侧 */}
              <div className={`${styles.info} ${styles.persistentInfo} ${styles.sideInfo}`}>
                <div className={styles.infoLine}>
                  <span className={styles.infoLabel}>工作坊信息:</span> 
                  <span className={styles.infoContent}>
                    <strong>Lab: {config.orgName || '加载中...'}</strong>
                    <span className={styles.infoDivider}> | </span>
                    <strong>Team: {config.teamName || '加载中...'}</strong>
                  </span>
                </div>
              </div>
              
              <div className={styles.introduction}>
                <h2>Workshop自服务添加工具</h2>
                <p>本工具帮助快速获取GitHub Copilot Business的试用权限。输入您的 GitHub 用户名并点击&quot;加入工作坊&quot;按钮，之后进入您的GitHub组织页面接受邀请即可加入。</p>
                <button 
                  className={styles.guideButton} 
                  onClick={() => setShowGuide(!showGuide)}
                >
                  {showGuide ? '隐藏操作指南' : '查看操作指南'}
                </button>
                
                {showGuide && (
                  <div className={styles.guideSection}>
                    <h3>操作指南</h3>
                    <ol>
                      <li>
                        <strong>第一步：输入 GitHub 用户名</strong> - 在输入框中填写您的 GitHub 用户名（不是邮箱，不需要@符号）
                        <div className={styles.imageContainer}>
                          <Image 
                            src="/userName.jpg" 
                            alt="输入GitHub用户名" 
                            className={styles.guideImage}
                            width={500}
                            height={300}
                          />
                        </div>
                      </li>
                      <li>
                        <strong>第二步：点击右侧&quot;加入工作坊&quot;</strong> - 系统将向您的 GitHub 账户发送邀请
                      </li>
                      <li>
                        <strong>第三步：接受邀请</strong>
                        <ol>
                          <li>
                            <strong>3.1 进入GitHub.com, 选择组织</strong> - 请进入您的 GitHub.com 后，在组织页面中选择您的组织
                            <div className={styles.imageContainer}>
                              <Image 
                                src="/clickOrg.jpg" 
                                alt="选择组织" 
                                className={styles.guideImage}
                                width={500}
                                height={300}
                              />
                            </div>
                          </li>
                          <li>
                            <strong>3.2 点击接受</strong> - 在组织页面中找到邀请后点击&quot;接受邀请&quot;
                            <div className={styles.imageContainer}>
                              <Image 
                                src="/clickAccept.jpg" 
                                alt="点击接受邀请" 
                                className={styles.guideImage}
                                width={500}
                                height={300}
                              />
                            </div>
                          </li>
                          <li>
                            <strong>3.3 点击加入</strong> - 接受邀请后，点击&quot;加入&quot;以完成加入流程（不用勾选 Ask for ...）
                            <div className={styles.imageContainer}>
                              <Image 
                                src="/clickJoin.jpg" 
                                alt="点击加入团队" 
                                className={styles.guideImage}
                                width={500}
                                height={300}
                              />
                            </div>
                          </li>
                        </ol>
                      </li>
                      <li>
                        <strong>第四步：登录并使用</strong> - 安装GitHub Copilot插件，在IDE中登录您的GitHub账户即可使用。
                        <div className={styles.imageContainer}>
                          <Image 
                            src="/login.jpg" 
                            alt="登录Copilot" 
                            className={styles.guideImage}
                            width={500}
                            height={300}
                          />
                        </div>
                      </li>
                      <li><strong>开始使用</strong> - 在您的代码编辑器中安装 GitHub Copilot 插件，开始使用 AI 辅助编码</li>
                    </ol>
                    <p className={styles.noteText}>注意：邀请成功后，您的用户名将显示在&quot;已加入账户&quot;列表中。</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 右侧内容: 用户添加和成员列表 */}
            <div className={styles.rightColumn}>
              <div className={styles.actionArea}>
                <form onSubmit={handleInvite} className={styles.form}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="输入GitHub用户名"
                    className={`${styles.input} ${styles.highContrast}`}
                    disabled={loading}
                  />
                  <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? (
                      <>
                        <span style={{ display: 'inline-block', marginRight: '8px' }}>处理中</span>
                        <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite' }}>...</span>
                      </>
                    ) : '加入工作坊'}
                  </button>
                </form>

                {message && (
                  <div className={`${styles.message} ${message.includes('成功') ? styles.success : styles.error}`}>
                    {message.includes('成功') ? '✅ ' : '⚠️ '}
                    {message}
                  </div>
                )}
              </div>

              <div className={styles.memberList}>
                <div className={styles.memberListHeader}>
                  <h2 data-count={filteredMembers.length}>已加入账户</h2>
                  <div className={styles.filterContainer}>
                    <input
                      type="text"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      placeholder="搜索账户"
                      className={`${styles.filterInput} ${styles.highContrast}`}
                    />
                  </div>
                </div>
                
                {filteredMembers.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem 1rem',
                    color: '#718096',
                    fontStyle: 'italic'
                  }}>
                    {filterText ? '没有匹配的账户' : '暂无账户'}
                  </div>
                ) : (
                  <div className={styles.members}>
                    {filteredMembers.map((member) => (
                      <div key={member.id} className={styles.memberCard}>
                        <span className={styles.username}>{member.login}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className={styles.footer}>
            <p>Join Workshop © {new Date().getFullYear()}</p>
            <p className={styles.privacyStatement}>隐私声明：本工具不收集或存留任何个人隐私数据，工作坊结束后将关闭站点结束服务。</p>
          </div>
        </div>
      </div>
    </main>
  );
}