package helpers;
import javax.swing.*;
import java.awt.*;

public class Login {
    public void init() {
        generateLoginWindow();
    }

    private void generateLoginWindow() {
        JFrame frame = new JFrame();

        JPanel panelButtons = new JPanel();
        JPanel panelLabel = new JPanel();
        JPanel base = new JPanel();
        frame.add(base);
        panelButtons.setBounds(0, 0, 350, 230);
        panelLabel.setBounds(0, 0, 350, 0);

        JButton personalButton = new JButton ("personal");
        personalButton.setBounds(50, 10, 100, 40);
        JButton companyButton = new JButton ("company");
        companyButton.setBounds(200, 10, 100, 40);

        panelButtons.add(personalButton);
        panelButtons.add(companyButton);
        JLabel label = new JLabel("SELECT USER:");
        label.setHorizontalAlignment(SwingConstants.CENTER);
        panelLabel.add(label);

        base.add(panelLabel);
        base.add(panelButtons);
        base.setLayout(new BoxLayout(base, BoxLayout.PAGE_AXIS));
        frame.add(base);

        frame.setSize(350,150);
        frame.setVisible(true);
    }
}
