package org.ante.jms.utils;

import freemarker.template.Template;
import freemarker.template.TemplateException;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;
import org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeUtility;
import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by tao on 2016/11/13.
 */
public class EmailUtil {
    private static final Logger logger = Logger.getLogger(EmailUtil.class);
    @Autowired
    private JavaMailSenderImpl mailSender;

    @Autowired
    private SimpleMailMessage mailMessage;

//  @Autowired
    private FreeMarkerConfigurer freeMarkerConfigurer;

    // 发送简单文本内容邮件
    public  void sendSimpleMail(String to,String content) {
        this.mailMessage.setTo(to);// 邮件接收者
        this.mailMessage.setText(content);// 邮件内容
        this.mailSender.send(mailMessage);// 发送
    }

    // 发送HTML内容邮件
    public void sendHtmlMail(String to,String content) {
        MimeMessage mailMsg = this.mailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(mailMsg);

        String html = "<html><head></head><body><h1>Hello</h1>" + content
                + "</body></html>";

        try {
            messageHelper.setTo(to);
            messageHelper.setText(html, true);// true 表示启动HTML格式的邮件
        } catch (MessagingException e) {
            logger.error(e.getMessage(), e);
        }
        this.mailSender.send(mailMessage);// 发送
    }


    // 发送邮件内容采用模板
    public void sendTemplateMail(String to) {

        try {
            MimeMessage mailMsg = this.mailSender.createMimeMessage();

            MimeMessageHelper messageHelper = new MimeMessageHelper(mailMsg,
                    true, "UTF-8");
            messageHelper.setTo(to);// 接收邮箱
            messageHelper.setFrom(this.mailMessage.getFrom());// 发送邮箱
            messageHelper.setSentDate(new Date());// 发送时间
            messageHelper.setSubject(this.mailMessage.getSubject());// 邮件标题

            // true 表示启动HTML格式的邮件
            messageHelper.setText(this.getMailText(to), true);// 邮件内容

            // 添加邮件附件
            FileSystemResource rarfile = new FileSystemResource(new File(
                    "E:\\UploadFileDemo\\mail图片测试.png"));

            // addAttachment addInline 两种附件添加方式
            // 以附件的形式添加到邮件
            // 使用MimeUtility.encodeWord 解决附件名中文乱码的问题
            messageHelper.addAttachment(MimeUtility.encodeWord("mail图片测试.png"),
                    rarfile);

            // <img src='cid:file'/> 此处将文件内容嵌入邮件页面中
            // 这里的'cid:file'与addInline('file',rarfile)中的file对应
            messageHelper.addInline("file", rarfile);

            this.mailSender.send(mailMsg);// 发送

        } catch (MessagingException e) {
            logger.error(e.getMessage(), e);
        } catch (UnsupportedEncodingException e) {
            logger.error(e.getMessage(), e);
        }

    }


    /**
     * 获取模板并将内容输出到模板
     *
     * @return
     */
    private String getMailText(String to) {
        String html = "";

        try {

            Map map = new HashMap();
            map.put("userName", "greensurfer");
            map.put("userId", to);
            map.put("password", "123456");
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-mm-dd hh:mm:ss");

            map.put("sendTime", sdf.format(new Date()));
            // 装载模板
            Template tpl = this.freeMarkerConfigurer.getConfiguration()
                    .getTemplate("forgetPassword.ftl");
            // 加入map到模板中 输出对应变量
            html = FreeMarkerTemplateUtils.processTemplateIntoString(tpl, map);

        } catch (IOException e) {
            e.printStackTrace();
        } catch (TemplateException e) {
            e.printStackTrace();
        }
        return html;
    }
}
