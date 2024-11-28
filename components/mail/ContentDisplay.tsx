import { Textarea } from "../ui/textarea";

interface ContentDisplayProps {
    content: string;
    className?: string;
    readOnly?: boolean;
    onChange?: (value: string) => void;
}

const isHTML = (str: string): boolean => {
    const htmlRegex = /<[a-z][\s\S]*>/i;
    return htmlRegex.test(str);
}; ``

const ContentDisplay: React.FC<ContentDisplayProps> = ({
    content,
    className,
    readOnly = true,
    onChange
}) => {
    if (!content) return null;

    if (isHTML(content)) {
        if (readOnly) {
            return (
                <div
                    className={className}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            );
        } else {
            return (
                <Textarea
                    value={content}
                    className={className}
                    onChange={(e) => onChange?.(e.target.value)}
                />
            );
        }
    }

    return (
        <Textarea
            value={content}
            className={className}
            readOnly={readOnly}
            onChange={(e) => onChange?.(e.target.value)}
        />
    );
};

export default ContentDisplay;