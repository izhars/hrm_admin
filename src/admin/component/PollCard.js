import React, { memo } from "react";
import { 
  Clock, CheckCircle2, XCircle, BarChart2, 
  Edit, Trash2, Loader2, AlertTriangle 
} from "lucide-react";

const PollCard = memo(({
  poll,
  theme,
  isHR,
  actionLoading,
  onVote,
  onShowResults,
  onEdit,
  onClose,
  onDelete
}) => {
  const expired = new Date(poll.expiresAt) < new Date() || poll.isClosed;
  const hasVoted = poll.hasVoted;
  const totalVotes = poll.totalVotes || 0;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return 'No expiry';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = () => {
    if (expired) return theme.error;
    if (hasVoted) return theme.success;
    return theme.primary;
  };

  return (
    <div style={{
      background: theme.card, 
      borderRadius: "20px", 
      overflow: "hidden",
      boxShadow: `0 20px 25px -5px rgba(0, 0, 0, ${theme.bg === "#0f172a" ? '0.3' : '0.1'})`, 
      border: `2px solid ${theme.border}`,
      transition: "all 0.3s ease",
      position: "relative"
    }}>
      {/* Status Indicator */}
      <div style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        background: expired ? theme.error : theme.success,
        color: "white",
        padding: "6px 14px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}>
        {expired ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
        {expired ? "CLOSED" : "ACTIVE"}
      </div>

      <div style={{ padding: "32px" }}>
        {/* Question */}
        <h3 style={{ 
          fontSize: "22px", 
          fontWeight: "700", 
          marginBottom: "24px",
          color: theme.text,
          lineHeight: "1.4",
          paddingRight: "100px" // Space for status badge
        }}>
          {poll.question}
        </h3>

        {/* Voting Progress */}
        {totalVotes > 0 && (
          <div style={{ 
            marginBottom: "20px", 
            padding: "12px", 
            background: theme.bg, 
            borderRadius: "12px" 
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              fontSize: "14px",
              color: theme.muted,
              marginBottom: "8px"
            }}>
              <span>Total Votes</span>
              <span style={{ fontWeight: "600", color: theme.text }}>{totalVotes}</span>
            </div>
          </div>
        )}

        {/* Options */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "14px", 
          marginBottom: "28px" 
        }}>
          {poll.options?.map((opt, i) => {
            const voteCount = opt.votes || 0;
            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            
            return (
              <button
                key={opt._id || i}
                disabled={hasVoted || expired || actionLoading[poll._id]}
                onClick={() => onVote(poll._id, i)}
                style={{
                  width: "100%", 
                  textAlign: "left", 
                  padding: "18px", 
                  borderRadius: "16px",
                  background: hasVoted || expired ? theme.bg : theme.card,
                  border: `2px solid ${hasVoted ? getStatusColor() : theme.border}`,
                  cursor: expired || hasVoted || actionLoading[poll._id] ? "not-allowed" : "pointer",
                  opacity: expired ? 0.6 : 1,
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  transition: "all 0.2s ease",
                  color: theme.text,
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Vote percentage background */}
                {hasVoted && (
                  <div style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${percentage}%`,
                    background: `${getStatusColor()}15`,
                    transition: "width 1s ease-out",
                    borderRadius: "14px"
                  }} />
                )}
                
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column",
                  position: "relative",
                  zIndex: 1
                }}>
                  <span style={{ fontWeight: "600", fontSize: "16px" }}>
                    {opt.text}
                  </span>
                  {hasVoted && (
                    <span style={{ 
                      fontSize: "13px", 
                      color: theme.muted, 
                      marginTop: "4px" 
                    }}>
                      {voteCount} votes ({percentage}%)
                    </span>
                  )}
                </div>
                
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px",
                  position: "relative",
                  zIndex: 1
                }}>
                  {actionLoading[poll._id] && (
                    <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  )}
                  {hasVoted && <CheckCircle2 size={18} color={getStatusColor()} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ 
          borderTop: `2px solid ${theme.border}`, 
          paddingTop: "20px" 
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            fontSize: "14px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                color: theme.muted
              }}>
                <Clock size={16} />
                <span>{formatDate(poll.expiresAt)}</span>
              </div>
              
              {expired && (
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "4px",
                  color: theme.error
                }}>
                  <AlertTriangle size={16} />
                  <span style={{ fontSize: "12px", fontWeight: "600" }}>EXPIRED</span>
                </div>
              )}
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button 
                onClick={() => onShowResults(poll)} 
                style={{ 
                  color: theme.primary, 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  transition: "all 0.2s"
                }}
              >
                <BarChart2 size={16} /> 
                Results
              </button>
              
              {isHR && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    onClick={() => onEdit(poll)} 
                    disabled={actionLoading[poll._id]}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "8px",
                      transition: "all 0.2s"
                    }}
                    title="Edit poll"
                  >
                    <Edit size={18} color={theme.primary} />
                  </button>
                  
                  <button 
                    onClick={() => onClose(poll._id)} 
                    disabled={actionLoading[poll._id] === "close" || expired}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: expired ? "not-allowed" : "pointer",
                      padding: "8px",
                      borderRadius: "8px",
                      transition: "all 0.2s",
                      opacity: expired ? 0.5 : 1
                    }}
                    title="Close poll"
                  >
                    {actionLoading[poll._id] === "close" ? 
                      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} color={theme.warning} /> : 
                      <XCircle size={18} color={theme.warning} />
                    }
                  </button>
                  
                  <button 
                    onClick={() => onDelete(poll._id)} 
                    disabled={actionLoading[poll._id] === "delete"}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "8px",
                      transition: "all 0.2s"
                    }}
                    title="Delete poll"
                  >
                    {actionLoading[poll._id] === "delete" ? 
                      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} color={theme.error} /> : 
                      <Trash2 size={18} color={theme.error} />
                    }
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PollCard.displayName = 'PollCard';

export default PollCard;
