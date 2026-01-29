'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, RefreshCw, MessageSquare, ArrowUpCircle, AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RedditPost {
    id: string;
    title: string;
    author: string;
    url: string;
    score: number;
    num_comments: number;
    created_utc: number;
    permalink: string;
    thumbnail: string;
}

export function RedditFeed() {
    const [posts, setPosts] = useState<RedditPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/reddit/singularity?sort=hot&limit=10');
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error?.message || 'Falha ao carregar r/Singularity');
            }

            setPosts(result.data.posts);
            setLastUpdated(new Date());
            logger.info('Reddit posts loaded into UI', { count: result.data.posts.length });
        } catch (err: any) {
            setError(err.message);
            logger.error('Failed to load Reddit posts in UI', { error: err.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <Card className="w-full h-full flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                        🤖 r/Singularity
                        <Badge variant="outline" className="font-mono text-[10px] uppercase">
                            Latest
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Tendências e discussões sobre IA
                    </CardDescription>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchPosts}
                    disabled={loading}
                    className={loading ? 'animate-spin' : ''}
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto pt-4 space-y-4">
                {error && (
                    <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {loading && posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-sm">Escaneando o futuro...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer relative"
                                onClick={() => window.open(`https://reddit.com${post.permalink}`, '_blank')}
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h3>
                                        <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 mt-1" />
                                    </div>

                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <ArrowUpCircle className="h-3 w-3" />
                                            {post.score}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="h-3 w-3" />
                                            {post.num_comments}
                                        </div>
                                        <span>•</span>
                                        <span>u/{post.author}</span>
                                        <span>•</span>
                                        <span>
                                            {formatDistanceToNow(new Date(post.created_utc * 1000), {
                                                addSuffix: true,
                                                locale: ptBR
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {lastUpdated && !loading && (
                    <p className="text-[10px] text-center text-muted-foreground pt-4">
                        Última atualização: {lastUpdated.toLocaleTimeString()}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
